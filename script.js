const glow = document.querySelector('.cursor-glow');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion && glow) {
  window.addEventListener('pointermove', (event) => {
    glow.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  });
});
