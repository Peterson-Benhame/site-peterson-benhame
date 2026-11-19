import { useEffect } from 'react';
import { gsap } from '../animations/gsapSetup.js';

export function useSectionScroll() {
  useEffect(() => {
    const handleClick = (event) => {
      if (
        event.defaultPrevented
        || event.button !== 0
        || event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.altKey
        || matchMedia('(prefers-reduced-motion: reduce)').matches
      ) return;

      const anchor = event.target.closest('a[href*="#"]');
      if (!anchor || anchor.classList.contains('skip-link')) return;

      const url = new URL(anchor.href, window.location.href);
      if (
        url.origin !== window.location.origin
        || url.pathname !== window.location.pathname
        || url.search !== window.location.search
        || !url.hash
      ) return;

      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;

      event.preventDefault();
      history.pushState(null, '', url.hash);
      gsap.killTweensOf(window);
      gsap.to(window, {
        duration: 1.05,
        ease: 'power3.inOut',
        overwrite: 'auto',
        scrollTo: {
          y: target,
          offsetY: 24,
          autoKill: true,
        },
        onComplete: () => {
          const hadTabIndex = target.hasAttribute('tabindex');
          if (!hadTabIndex) target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
          if (!hadTabIndex) {
            target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
          }
        },
      });
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
      gsap.killTweensOf(window);
    };
  }, []);
}
