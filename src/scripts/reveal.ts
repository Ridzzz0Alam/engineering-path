// Fades content in as it scrolls into view, from below when scrolling down and from above when scrolling up.
// Only elements that have been off screen are hidden, so the page still works without JS and doesn't flash on load.

const TARGETS = '.section-head, .stage-title, .card, .feature, .stage, .about-inner, .course-credit, .legend, .prose > *';
const STAGGER_MS = 60;
const MAX_DELAY_MS = 240;

export function initReveal() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const obs = new IntersectionObserver(
    (entries) => {
      let entering = 0;
      for (const { target, isIntersecting, boundingClientRect } of entries) {
        const el = target as HTMLElement;
        if (!isIntersecting) {
          el.dataset.reveal = boundingClientRect.top < 0 ? 'above' : 'below';
        } else if (el.dataset.reveal === 'above' || el.dataset.reveal === 'below') {
          el.style.animationDelay = `${Math.min(entering++ * STAGGER_MS, MAX_DELAY_MS)}ms`;
          el.dataset.reveal = el.dataset.reveal === 'above' ? 'from-above' : 'from-below';
        }
      }
    },
    { rootMargin: '0px 0px -4% 0px' },
  );

  document.querySelectorAll<HTMLElement>(TARGETS).forEach((el) => {
    // Animate only the outermost match, so nested cards don't fade twice.
    if (!el.parentElement?.closest(TARGETS)) obs.observe(el);
  });
}
