export function isTouchFirstDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const hasTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
  return hasTouch && window.matchMedia('(pointer: coarse)').matches;
}
