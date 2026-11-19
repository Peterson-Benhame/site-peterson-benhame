import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);

export const motionQuery = 'all';
export const desktopMotionQuery = '(min-width: 801px)';

export function clearMotionStyles(targets) {
  gsap.set(targets, { clearProps: 'opacity,transform,clipPath,height,overflow' });
}

export { gsap, ScrollToPlugin, ScrollTrigger, useGSAP };
