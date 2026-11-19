import { useEffect } from 'react';

export function useReveal() {
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches || typeof IntersectionObserver === 'undefined') return undefined;

    const elements = [...document.querySelectorAll('[data-reveal]')];
    elements.forEach((element) => element.classList.add('is-reveal-pending'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('is-reveal-pending');
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -12% 0px',
    });

    elements.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      elements.forEach((element) => element.classList.remove('is-reveal-pending'));
    };
  }, []);
}
