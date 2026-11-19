import { useEffect } from 'react';

export function useCinemaHero({ heroRef, canvasRef, posterRef, illustrationRef, beatsRef }) {
  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    const poster = posterRef.current;
    const illustration = illustrationRef.current;
    const beats = beatsRef.current;
    const media = window.PB_CINEMA || {};

    if (!hero || !canvas || !poster || !beats) return undefined;

    const showPoster = () => {
      poster.hidden = false;
      illustration?.setAttribute('hidden', '');
    };
    const showIllustration = () => {
      poster.hidden = true;
      illustration?.removeAttribute('hidden');
    };

    poster.addEventListener('load', showPoster);
    poster.addEventListener('error', showIllustration);
    if (poster.complete) {
      if (poster.naturalWidth) showPoster();
      else showIllustration();
    }

    const frames = media.frames;
    if (!Array.isArray(frames) || !frames.length) {
      beats.hidden = true;
      return () => {
        poster.removeEventListener('load', showPoster);
        poster.removeEventListener('error', showIllustration);
      };
    }

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const desktop = matchMedia('(min-width: 901px)');
    const cache = new Map();
    const inflight = new Set();
    let enabled = false;
    let target = 0;
    let frameRequest = 0;
    let generation = 0;

    const activatePresentation = () => {
      hero.classList.add('cinema-enabled');
      beats.hidden = false;
    };

    const deactivatePresentation = () => {
      hero.classList.remove('cinema-enabled');
      beats.hidden = true;
      canvas.hidden = true;
    };

    const paint = (image) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
      const imageWidth = image.naturalWidth * scale;
      const imageHeight = image.naturalHeight * scale;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, (canvas.width - imageWidth) * 0.8, (canvas.height - imageHeight) / 2, imageWidth, imageHeight);
    };

    const load = (index) => {
      if (!enabled || index < 0 || index >= frames.length || cache.has(index) || inflight.has(index) || inflight.size >= 4) return;
      const version = generation;
      inflight.add(index);
      const image = new Image();
      image.onload = () => {
        if (version !== generation) return;
        activatePresentation();
        inflight.delete(index);
        cache.set(index, image);
        while (cache.size > 18) {
          const farthest = [...cache.keys()].sort((a, b) => Math.abs(b - target) - Math.abs(a - target))[0];
          cache.delete(farthest);
        }
        if (index === target) {
          canvas.hidden = false;
          paint(image);
        }
        if (!cache.has(target)) load(target);
      };
      image.onerror = () => {
        if (version === generation) {
          inflight.delete(index);
          if (index === target) canvas.hidden = true;
        }
      };
      image.src = frames[index];
    };

    const update = () => {
      frameRequest = 0;
      if (!enabled) return;
      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) return;
      const progress = Math.max(0, Math.min(1, -rect.top / (hero.offsetHeight - innerHeight)));
      target = Math.round(progress * (frames.length - 1));
      if (cache.has(target)) {
        canvas.hidden = false;
        paint(cache.get(target));
      } else {
        load(target);
      }
      load(target + 1);
      load(target - 1);
      [...beats.children].forEach((element, index) => {
        element.classList.toggle('active', index === Math.min(2, Math.floor(progress * 3)));
      });
    };

    const schedule = () => {
      if (!frameRequest) frameRequest = requestAnimationFrame(update);
    };

    const mode = () => {
      enabled = desktop.matches && !navigator.connection?.saveData;
      generation += 1;
      cache.clear();
      inflight.clear();
      deactivatePresentation();
      if (enabled) schedule();
    };

    desktop.addEventListener('change', mode);
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule, { passive: true });
    mode();

    return () => {
      generation += 1;
      if (frameRequest) cancelAnimationFrame(frameRequest);
      desktop.removeEventListener('change', mode);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      poster.removeEventListener('load', showPoster);
      poster.removeEventListener('error', showIllustration);
      deactivatePresentation();
    };
  }, [beatsRef, canvasRef, heroRef, illustrationRef, posterRef]);
}
