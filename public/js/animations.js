/* Costech Help Desk motion enhancements. Decorative only; no application logic. */
(() => {
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header, .about-header');

  const updateHeader = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (reduceMotion) return;

  const candidates = [
    '.hero-content', '.hero-visual', '.benefit', '.section-heading', '.feature-card',
    '.about-content', '.about-hero-copy', '.about-hero-visual', '.system-card',
    '.value-card', '.highlight-card', '.partnership-panel', '.contact-panel',
    '.login-container', '.register-container', '.dashboard-card', '.dashboard-section',
    '.admin-requests', '.admin-users', '.admin-staff-management', '.admin-reports',
    '.ticket-container', '.ticket-card', '.user-card', '.report-card', '.tickets-container'
  ].join(',');
  const elements = [...document.querySelectorAll(candidates)];
  if (!elements.length || !('IntersectionObserver' in window)) return;

  elements.forEach((element, index) => {
    if (element.closest('.hero-content, .hero-visual') && element !== document.querySelector('.hero-content') && element !== document.querySelector('.hero-visual')) return;
    element.classList.add('motion-reveal');
    element.style.setProperty('--motion-delay', `${Math.min(index % 4, 3) * 70}ms`);
  });

  document.body.classList.add('motion-ready');
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });

  elements.filter(element => element.classList.contains('motion-reveal')).forEach(element => observer.observe(element));
  // Ensure the first viewport animates in immediately instead of waiting for a scroll.
  requestAnimationFrame(() => {
    elements.filter(element => element.classList.contains('motion-reveal')).forEach(element => {
      if (element.getBoundingClientRect().top < window.innerHeight * 0.92) {
        element.classList.add('is-visible');
        observer.unobserve(element);
      }
    });
  });
})();
