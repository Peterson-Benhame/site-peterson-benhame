export function trackEvent(name, properties = {}) {
  if (typeof window === 'undefined' || typeof window.PB_ANALYTICS !== 'function') return;
  window.PB_ANALYTICS(name, properties);
}
