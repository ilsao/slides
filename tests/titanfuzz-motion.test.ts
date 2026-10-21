import { expect, it, vi } from 'vitest';
import { titanTransition } from '../decks/titanfuzz/motion';

function layer(text: string) {
  const animations: { keyframes: Keyframe[]; options: KeyframeAnimationOptions }[] = [];
  const make = (content: string, style = {}) => ({
    textContent: content, style,
    animate: vi.fn((keyframes, options) => {
      animations.push({ keyframes, options });
      return { cancel: vi.fn(), finished: Promise.resolve() } as unknown as Animation;
    }),
  });
  const main = make('content');
  const chapter = make(text);
  const footer = make(text);
  const element = {
    ...make(''),
    querySelector: (selector: string) => ({ main, '.tf-header > span:last-child': chapter, footer })[selector],
  } as unknown as HTMLElement;
  return { element, main, chapter, footer, animations };
}

it.each([1, -1] as const)('hands over text without a ghost overlap in direction %s', direction => {
  const old = layer('before');
  const next = layer('after');
  const animations = titanTransition.animate({ outgoing: old.element, incoming: next.element }, direction) as Animation[];
  const exit = old.main.animate.mock.calls[0];
  const entrance = next.main.animate.mock.calls[0];
  expect(exit[1].duration).toBeLessThanOrEqual(entrance[1].delay);
  expect(exit[0][1]).toEqual({ opacity: 0, transform: `translateY(${-10 * direction}px)` });
  expect(entrance[0][0]).toEqual({ opacity: 0, transform: `translateY(${16 * direction}px)` });
  for (const key of ['chapter', 'footer'] as const) {
    expect(old[key].animate.mock.calls[0][1].duration).toBeLessThanOrEqual(next[key].animate.mock.calls[0][1].delay);
  }
  expect(animations).toHaveLength(7);
  expect(animations.every(animation => typeof animation.cancel === 'function')).toBe(true);
});

it('keeps identical navigation labels stationary', () => {
  const old = layer('same');
  const next = layer('same');
  titanTransition.animate({ outgoing: old.element, incoming: next.element }, 1);
  expect(old.chapter.animate).not.toHaveBeenCalled();
  expect(next.chapter.animate).not.toHaveBeenCalled();
});
