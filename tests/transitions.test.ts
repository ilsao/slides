import { expect, it, vi } from 'vitest';
import { fadeTransition } from '../src/presentation/transitions';

it('fades only the outgoing snapshot while the destination remains opaque', () => {
  const animate = vi.fn(() => ({} as Animation));
  const incomingAnimate = vi.fn();
  const transition = fadeTransition(.3);
  transition.animate({ outgoing: { animate } as unknown as HTMLElement, incoming: { animate: incomingAnimate } as unknown as HTMLElement }, 1);
  expect(animate).toHaveBeenCalledWith([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease-out', fill: 'both' });
  expect(incomingAnimate).not.toHaveBeenCalled();
});
