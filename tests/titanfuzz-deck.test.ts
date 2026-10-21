import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { titanFuzzDeck as deck } from '../decks/titanfuzz/deck';
import { initialState, reduce, restore } from '../src/presentation/state';
import type { SlideRenderProps } from '../src/presentation/types';

it('traverses all 22 states forward and backward without entering retired pages', () => {
  expect(deck.slides).toHaveLength(11);
  let state = initialState(deck);
  const visited = [`${state.slideId}:${state.step}`];
  for (;;) {
    const next = reduce(deck, state, { type: 'next' });
    if (next === state) break;
    state = next;
    visited.push(`${state.slideId}:${state.step}`);
  }
  expect(visited).toHaveLength(22);
  expect(visited.filter(id => id.startsWith('method:'))).toHaveLength(12);
  expect(state.slideId).toBe('closing');
  for (const expected of visited.slice(0, -1).reverse()) {
    state = reduce(deck, state, { type: 'previous' });
    expect(`${state.slideId}:${state.step}`).toBe(expected);
  }
  for (const id of ['challenge', 'sequence-bug', 'distribution', 'oracle', 'assertion']) {
    expect(visited.some(value => value.startsWith(`${id}:`))).toBe(false);
  }
});

it('restores retained v9 pages and resets progress that points to retired pages', () => {
  const old = { ...initialState(deck), deckVersion: 9, slideId: 'metrics', step: 0 };
  expect(restore(deck, old)).toMatchObject({ deckVersion: 10, slideId: 'metrics', step: 0 });
  expect(restore(deck, { ...old, slideId: 'method', step: 7 })).toMatchObject({ deckVersion: 10, slideId: 'method', step: 0 });
  expect(restore(deck, { ...old, slideId: 'oracle' })).toEqual(initialState(deck));
});

it('uses live page IDs for chapters and the nine previews, with the cover centered', () => {
  const ids = new Set<string>(deck.slides.map(slide => slide.id));
  expect(deck.previews).toHaveLength(9);
  expect(deck.previews[4].slideId).toBe('cover');
  for (const entry of [...deck.previews, ...deck.chapters]) expect(ids.has(entry.slideId)).toBe(true);
});

it('renders still states without animated markers, hidden charts or nested preview links', () => {
  const noop = () => {};
  const actions = { next: noop, previous: noop, nextSlide: noop, previousSlide: noop, jump: noop, restart: noop };
  for (const slide of deck.slides) {
    for (let step = 0; step < slide.steps; step++) {
      const props: SlideRenderProps = { slide, step, actions, mode: 'playback', active: true, still: false, reducedMotion: true };
      const html = renderToStaticMarkup(createElement(deck.RenderSlide, props));
      expect(html).toContain('data-still="true"');
      expect(html).not.toContain('<circle');
      if (slide.id === 'method' && [2, 4, 9].includes(step)) expect(html).toContain('<math');
      if (slide.id === 'results') {
        expect(html.match(/data-ready="true"/g)).toHaveLength(3);
        expect(html).not.toContain('scaleX(0)');
      }
    }
    const preview: SlideRenderProps = { slide, step: slide.steps - 1, actions, mode: 'preview', active: false, still: true, reducedMotion: true };
    expect(renderToStaticMarkup(createElement(deck.RenderSlide, preview))).not.toContain('<a ');
  }
});
