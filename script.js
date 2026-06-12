/* ════════════════════════════════════════════════════════════
   script.js — Portfolio Interactivity
   • Particle canvas (hero)
   • Scroll-to-reveal (IntersectionObserver)
   • Sticky nav scroll state
   • Hamburger / mobile menu
   • Contact form handler
════════════════════════════════════════════════════════════ */

'use strict';


/* ─────────────────────────────────────────────
   1. PARTICLE CANVAS
───────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, particles;
  let animId;

  // Respect reduced-motion preference
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    canvas.style.display = 'none';
    return;
  }

  // ── Config
  const CONFIG = {
    count:         90,
    speedMin:      0.08,
    speedMax:      0.35,
    sizeMin:       1,
    sizeMax:       2.5,
    connectDist:   130,
    colors: [
      'rgba(139, 92, 246,',   // Violet
      'rgba(167,139,250,',    // Violet light
      'rgba(6, 182, 212,',    // Teal
    ],
  };

  function resize() {
    width  = canvas.width  = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
    buildParticles();
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function buildParticles() {
    particles = Array.from({ length: CONFIG.count }, () => ({
      x:      rand(0, width),
      y:      rand(0, height),
      vx:     rand(-CONFIG.speedMax, CONFIG.speedMax),
      vy:     rand(-CONFIG.speedMax, CONFIG.speedMax),
      size:   rand(CONFIG.sizeMin, CONFIG.sizeMax),
      color:  CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)],
      alpha:  rand(0.2, 0.7),
    }));
  }

  function drawParticle(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color + p.alpha + ')';
    ctx.fill();
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.connectDist) {
          const opacity = (1 - dist / CONFIG.connectDist) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function update() {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (p.x < 0 || p.x > width)  p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    });
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    drawConnections();
    particles.forEach(drawParticle);
    update();
    animId = requestAnimationFrame(loop);
  }

  // Pause animation when tab is hidden (performance)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      loop();
    }
  });

  resize();
  loop();

  // Debounced resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });
}());


/* ─────────────────────────────────────────────
   2. SCROLL-TO-REVEAL
───────────────────────────────────────────── */
(function initReveal() {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    // Make everything visible immediately
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('is-visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Fire once
        }
      });
    },
    {
      root:       null,
      rootMargin: '0px 0px -60px 0px', // Trigger 60px before bottom of viewport
      threshold:  0.1,
    }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}());


/* ─────────────────────────────────────────────
   3. STICKY NAV — scroll state
───────────────────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const SCROLL_THRESHOLD = 40;

  function updateNav() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav(); // Run on load
}());


/* ─────────────────────────────────────────────
   4. HAMBURGER / MOBILE MENU
───────────────────────────────────────────── */
(function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    isOpen = false;
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    isOpen ? closeMenu() : openMenu();
  });

  // Close when a link is clicked
  mobileMenu.querySelectorAll('[data-close]').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });
}());


/* ─────────────────────────────────────────────
   5. CONTACT FORM
───────────────────────────────────────────── */
(function initForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  // Input focus micro-interaction — floating label feel
  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', () => {
      input.closest('.form-group')?.classList.add('is-focused');
    });
    input.addEventListener('blur', () => {
      input.closest('.form-group')?.classList.remove('is-focused');
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn     = form.querySelector('button[type="submit"]');
    const btnText = btn.querySelector('.btn__text');

    // Basic validation
    const name    = form.querySelector('#name').value.trim();
    const email   = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();

    if (!name || !email || !message) {
      showError('Please fill in all required fields.');
      return;
    }

    if (!isValidEmail(email)) {
      showError('Please enter a valid email address.');
      return;
    }

    // Loading state
    btn.disabled    = true;
    btnText.textContent = 'Sending…';
    success.textContent = '';

    // Simulate async send (replace with real fetch() to your backend/API)
    setTimeout(() => {
      btn.disabled        = false;
      btnText.textContent = 'Send Message';
      success.textContent = '✓ Message sent! I\'ll get back to you within 24h.';
      form.reset();

      // Clear success message after 6s
      setTimeout(() => {
        success.textContent = '';
      }, 6000);
    }, 1400);
  });

  function showError(msg) {
    success.style.color = '#F87171';
    success.textContent = msg;
    setTimeout(() => {
      success.style.color = '';
      success.textContent = '';
    }, 4000);
  }

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }
}());


/* ─────────────────────────────────────────────
   6. SMOOTH ANCHOR SCROLL (offset for nav)
───────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      e.preventDefault();
      const navHeight = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-height')
      ) || 72;

      const top = target.getBoundingClientRect().top
                + window.scrollY
                - navHeight;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}());


/* ─────────────────────────────────────────────
   7. SUBTLE PARALLAX ON HERO AURORA
───────────────────────────────────────────── */
(function initParallax() {
  const aurora = document.querySelector('.hero__aurora');
  if (!aurora) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        aurora.style.transform = `translateY(${scrolled * 0.3}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}());


/* ─────────────────────────────────────────────
   8. SKILL ITEM — staggered reveal on hover
───────────────────────────────────────────── */
(function initSkillItems() {
  document.querySelectorAll('.skills__category').forEach(card => {
    const items = card.querySelectorAll('.skill-item');

    card.addEventListener('mouseenter', () => {
      items.forEach((item, i) => {
        item.style.transitionDelay = `${i * 30}ms`;
      });
    });

    card.addEventListener('mouseleave', () => {
      items.forEach(item => {
        item.style.transitionDelay = '0ms';
      });
    });
  });
}());


/* ─────────────────────────────────────────────
   9. NAVBAR SCROLL (from inline script)
───────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});


/* ─────────────────────────────────────────────
   10. HAMBURGER / MOBILE MENU (from inline script)
───────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});
function closeMobileMenu() {
  hamburger.classList.remove('active');
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}


/* ─────────────────────────────────────────────
   11. SCROLL ANIMATIONS (from inline script)
───────────────────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = `${(entry.target.dataset.delay || 0)}ms`;
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

// Stagger children inside grids
document.querySelectorAll('.skills-grid .skill-card, .projects-grid .project-card').forEach((el, i) => {
  el.dataset.delay = (i % 3) * 80;
});

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));


/* ─────────────────────────────────────────────
   12. ACTIVE NAV LINK (from inline script)
───────────────────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const scrollSpy = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${entry.target.id}` ? 'var(--text)' : '';
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => scrollSpy.observe(s));


/* ─────────────────────────────────────────────
   13. HERO ENTRANCE (from inline script)
───────────────────────────────────────────── */
window.addEventListener('load', () => {
  document.querySelectorAll('.hero .fade-up').forEach((el, i) => {
    setTimeout(() => {
      el.style.transitionDelay = '0ms';
      el.classList.add('visible');
    }, 100 + i * 120);
  });
});