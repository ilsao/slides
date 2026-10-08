import { describe, expect, it } from 'vitest';
import { defineDeck } from '../src/presentation/types';
import { initialState, reduce, restore, progressKey } from '../src/presentation/state';

const deck = defineDeck({ id: 'test', title: 'Test', version: 2, size: { width: 1200, height: 900 },
  slides: [{ id: 'intro', title: 'Intro', steps: 3 }, { id: 'end', title: 'End', steps: 1 }],
  previews: [{ slideId: 'intro' }], RenderSlide: () => null,
});

describe('shared navigation', () => {
  it('walks steps and pages, reverses from the completed previous page, and respects boundaries', () => {
    let state = initialState(deck);
    const points: [string, number][] = [['intro', 0], ['intro', 1], ['intro', 2], ['end', 0]];
    for (const point of points) { expect([state.slideId, state.step]).toEqual(point); state = reduce(deck, state, { type: 'next' }); }
    for (const point of [...points].reverse()) { expect([state.slideId, state.step]).toEqual(point); state = reduce(deck, state, { type: 'previous' }); }
    expect(reduce(deck, state, { type: 'jump', id: 'missing' })).toBe(state);
    expect(reduce(deck, state, { type: 'previousSlide' })).toBe(state);
    expect(reduce(deck, state, { type: 'nextSlide' }).slideId).toBe('end');
    const completed = { ...state, slideId: 'end', step: 0 };
    expect(reduce(deck, completed, { type: 'restart' })).toEqual({ ...initialState(deck), generation: 1 });
  });
  it('restores known slides, resets steps for deck revisions, and rejects corrupt progress', () => {
    const state = { ...initialState(deck), step: 2 };
    expect(restore(deck, state)).toEqual(state);
    expect(restore(deck, { ...state, deckVersion: 1 })).toEqual(initialState(deck));
    for (const value of [null, {}, { ...state, slideId: 'deleted' }, { ...state, step: -1 }, { ...state, step: 3 }, { ...state, generation: NaN }])
      expect(restore(deck, value)).toEqual(initialState(deck));
    expect(progressKey('one')).not.toBe(progressKey('two'));
  });
});

it('rejects invalid author definitions before navigation or previews break', () => {
  expect(() => defineDeck({ ...deck, slides: [] })).toThrow();
  expect(() => defineDeck({ ...deck, slides: [...deck.slides, deck.slides[0]] })).toThrow();
  expect(() => defineDeck({ ...deck, previews: [{ slideId: 'missing' }] })).toThrow();
  expect(() => defineDeck({ ...deck, size: { width: 0, height: 900 } })).toThrow();
});
