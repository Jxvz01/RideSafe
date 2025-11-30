// ── Scroll nav ──────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 20);
});

// ── Mobile menu ──────────────────────────────
const mobMenuBtn = document.getElementById('mobMenuBtn');
const mobMenu = document.getElementById('mobMenu');
mobMenuBtn?.addEventListener('click', () => {
  mobMenu?.classList.toggle('open');
});
mobMenu?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobMenu?.classList.remove('open'));
});

// ── Intersection observer animations ─────────
const animEls = document.querySelectorAll('.anim-up');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target); }
  });
}, { threshold: 0.12 });
animEls.forEach(el => observer.observe(el));

// ── Hero particles ──────────────────────────
const particleContainer = document.getElementById('heroParticles');
if (particleContainer) {
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.style.cssText = `position:absolute;width:${2+Math.random()*3}px;height:${2+Math.random()*3}px;border-radius:50%;background:${Math.random()>.5?'rgba(0,212,255,.4)':'rgba(0,255,136,.3)'};left:${Math.random()*100}%;top:${Math.random()*100}%;animation:particle-rise ${3+Math.random()*4}s ease-in-out infinite;animation-delay:-${Math.random()*4}s`;
    particleContainer.appendChild(p);
  }
}

// ── Pulse bars (device card) ─────────────────
const pulseBars = document.getElementById('pulseBars');
if (pulseBars) {
  const bars = [];
  for (let i = 0; i < 24; i++) {
    const b = document.createElement('div');
    b.className = 'pulse-bar';
    b.style.height = (4 + Math.random() * 28) + 'px';
    pulseBars.appendChild(b);
    bars.push(b);
  }
  setInterval(() => {
    bars.forEach(b => {
      b.style.height = (4 + Math.random() * 28) + 'px';
      b.style.opacity = (.4 + Math.random() * .6).toString();
    });
  }, 500);
}

// ── Animate numbers ──────────────────────────
function animateNumber(el, target, decimals = 0) {
  let start = 0; const dur = 1800;
  const step = (ts) => {
    if (!start) start = ts;
    const pct = Math.min((ts - start) / dur, 1);
    const ease = 1 - Math.pow(1 - pct, 3);
    el.textContent = (target * ease).toFixed(decimals);
    if (pct < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ── Smooth scroll ────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const id = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
