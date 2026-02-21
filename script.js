/**
 * script.js — dp!h3r0x CTF Website
 * Handles: typing effect, particles, cursor, scroll animations,
 *          navbar state, mobile menu, year filter, back-to-top.
 */

/* ============================================================
   1. TYPING EFFECT
============================================================ */
const phrases = [
  "Capture The Flag | Cybersecurity",
  "Reverse Engineering | Binary Exploitation",
  "Cryptography | Forensics | Web Hacking",
  "OSINT | Network Analysis | Scripting",
];

let phraseIdx  = 0;
let charIdx    = 0;
let isDeleting = false;

const typingEl = document.getElementById('typingText');

function type() {
  if (!typingEl) return;

  const current = phrases[phraseIdx];

  if (isDeleting) {
    typingEl.textContent = current.substring(0, charIdx - 1);
    charIdx--;
  } else {
    typingEl.textContent = current.substring(0, charIdx + 1);
    charIdx++;
  }

  let delay = isDeleting ? 40 : 80;

  if (!isDeleting && charIdx === current.length) {
    // Pause at end before deleting
    delay = 2200;
    isDeleting = true;
  } else if (isDeleting && charIdx === 0) {
    isDeleting = false;
    phraseIdx  = (phraseIdx + 1) % phrases.length;
    delay = 500;
  }

  setTimeout(type, delay);
}

// Kick off typing
setTimeout(type, 1000);


/* ============================================================
   2. CANVAS PARTICLE SYSTEM
============================================================ */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles;

  const PARTICLE_COUNT = window.innerWidth < 600 ? 40 : 80;
  const MAX_DIST       = 130;
  const COLORS         = ['rgba(0,245,255,', 'rgba(0,255,136,', 'rgba(61,155,255,'];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function Particle() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.r  = Math.random() * 1.8 + 0.4;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = Math.random() * 0.5 + 0.1;
  }

  Particle.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W) this.vx *= -1;
    if (this.y < 0 || this.y > H) this.vy *= -1;
  };

  Particle.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color + this.alpha + ')';
    ctx.fill();
  };

  function buildParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,245,255,${alpha})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }

  resize();
  buildParticles();
  animate();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      buildParticles();
    }, 200);
  });
})();


/* ============================================================
   3. CUSTOM CURSOR GLOW
============================================================ */
(function initAdvancedCursor() {
  const glow = document.getElementById("cursorGlow");
  if (!glow) return;

  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let cursor = { x: mouse.x, y: mouse.y };
  let velocity = { x: 0, y: 0 };

  const speed = 0.15;
  const maxStretch = 0.35;

  // Track mouse
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Click animation
  window.addEventListener("mousedown", () => {
    glow.style.transition = "transform 0.15s ease";
    glow.style.transform += " scale(0.7)";
  });

  window.addEventListener("mouseup", () => {
    glow.style.transition = "transform 0.25s ease";
  });

  // Magnetic hover effect
  document.querySelectorAll("a, button, .magnetic").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      glow.style.background = "radial-gradient(circle, #ff4d6d, transparent 70%)";
      glow.style.transform += " scale(1.8)";
    });

    el.addEventListener("mouseleave", () => {
      glow.style.background = "radial-gradient(circle, #00f0ff, transparent 70%)";
    });
  });

  function animate() {
    // Smooth follow
    velocity.x = (mouse.x - cursor.x) * speed;
    velocity.y = (mouse.y - cursor.y) * speed;

    cursor.x += velocity.x;
    cursor.y += velocity.y;

    // Stretch based on speed
    const stretch = Math.min(
      Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y) * 0.3,
      maxStretch
    );

    glow.style.transform = `
      translate(${cursor.x}px, ${cursor.y}px)
      translate(-50%, -50%)
      scale(${1 + stretch}, ${1 - stretch})
    `;

    requestAnimationFrame(animate);
  }

  animate();
})();




/* ============================================================
   4. NAVBAR: scroll state + active link
============================================================ */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    // Scrolled class
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link highlight
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 90;
      if (window.scrollY >= top) current = section.id;
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').substring(1);
      link.classList.toggle('active', href === current);
    });

    // Back to top
    const btt = document.getElementById('backToTop');
    if (btt) btt.classList.toggle('visible', window.scrollY > 300);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();


/* ============================================================
   5. MOBILE HAMBURGER MENU
============================================================ */
(function initHamburger() {
  const btn       = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const allLinks  = document.querySelectorAll('.nav-link');

  if (!btn || !navLinks) return;

  btn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', isOpen);
  });

  // Close on link click
  allLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    }
  });
})();


/* ============================================================
   6. BACK TO TOP BUTTON
============================================================ */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================
   7. SCROLL REVEAL ANIMATION
============================================================ */
(function initScrollReveal() {
  // Apply reveal class to target elements
  const targets = [
    '.about-text',
    '.about-skills',
    '.member-card',
    '.table-wrap',
    '.contact-blurb',
    '.contact-card',
    '.filter-bar',
  ];

  targets.forEach((selector, sIdx) => {
    document.querySelectorAll(selector).forEach((el, eIdx) => {
      el.classList.add('reveal');
      // Stagger cards within same type
      if (eIdx > 0) el.classList.add(`reveal-delay-${Math.min(eIdx, 3)}`);
    });
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();


/* ============================================================
   8. COMPETITION YEAR FILTER
============================================================ */
(function initFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const rows        = document.querySelectorAll('.comp-table tbody tr');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      rows.forEach(row => {
        const year = row.dataset.year;
        if (filter === 'all' || year === filter) {
          row.style.display = '';
          // Fade-in animation
          row.style.opacity = '0';
          row.style.transition = 'opacity 0.3s ease';
          requestAnimationFrame(() => { row.style.opacity = '1'; });
        } else {
          row.style.display = 'none';
        }
      });
    });
  });
})();


/* ============================================================
   9. FOOTER YEAR
============================================================ */
(function setYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ============================================================
   10. STAT NUMBER COUNTER ANIMATION
============================================================ */
(function initCounters() {
  const statNums = document.querySelectorAll('.stat-num');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.textContent, 10);
      const suffix = el.textContent.replace(/[0-9]/g, '');
      let start    = 0;
      const step   = Math.ceil(target / 40);
      const timer  = setInterval(() => {
        start += step;
        if (start >= target) {
          start = target;
          clearInterval(timer);
        }
        el.textContent = start + suffix;
      }, 35);
      observer.unobserve(el);
    });
  }, { threshold: 0.6 });

  statNums.forEach(el => observer.observe(el));
})();
