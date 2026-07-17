// Single source of truth for scroll. Written by input events, damped once
// per frame by whoever calls update(), read by both the DOM cards and the
// terrain shader.
export const scrollState = {
  target: 0,
  current: 0,
};

// ponytail: exponential damp one-liner, swap for maath easing if it ever feels off
export function updateScroll(dt: number) {
  const { target, current } = scrollState;
  scrollState.current = current + (target - current) * (1 - Math.exp(-6 * dt));
}

export function attachScrollInput(): () => void {
  let lastTouchY = 0;

  const onWheel = (e: WheelEvent) => {
    scrollState.target += e.deltaY;
  };
  const onTouchStart = (e: TouchEvent) => {
    lastTouchY = e.touches[0].clientY;
  };
  const onTouchMove = (e: TouchEvent) => {
    const y = e.touches[0].clientY;
    scrollState.target += (lastTouchY - y) * 2;
    lastTouchY = y;
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ')
      scrollState.target += 400;
    if (e.key === 'ArrowUp' || e.key === 'PageUp') scrollState.target -= 400;
  };

  window.addEventListener('wheel', onWheel, { passive: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('keydown', onKeyDown);
  return () => {
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('keydown', onKeyDown);
  };
}
