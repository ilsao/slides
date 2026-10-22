import { describe, expect, it } from 'vitest';
import { allSlides, slides, scheduledBefore, DECK_VERSION } from '../src/deck';
import { initialState, reduce } from '../../../src/presentation/state';
import { initialRest, restRemaining, updateRest } from '../src/rest';
import type { DeckDefinition } from '../../../src/presentation/types';

describe('workshop content', () => {
  it('preserves every source slide and hides only the unfinished lab', () => {
    expect(allSlides.length).toBe(slides.length+1); expect(slides.length).toBe(92);
    expect(allSlides.filter(s=>s.hidden).map(s=>s.id)).toEqual([46]);
    expect(new Set(allSlides.map(s=>s.id)).size).toBe(allSlides.length);
    for(const s of allSlides) { expect(s.notes.length).toBeGreaterThan(0); expect(s.cues.length).toBeGreaterThan(0); expect(s.notes.join(' ')).not.toContain('teach.md'); }
  });
  it('keeps exactly three hours including the dedicated Q&A', () => {
    expect(slides.reduce((sum,s)=>sum+s.durationSeconds,0)).toBe(10800);
    expect(scheduledBefore(48)).toBe(10200);
  });
});

const deck: DeckDefinition = { id: 'backend-workshop', title: 'Backend Workshop', version: DECK_VERSION,
 size: { width: 1600, height: 900 }, slides: slides.map(slide => ({ id: slide.id, title: slide.title, steps: slide.cues.length })),
 previews: [], RenderSlide: () => null };
describe('all workshop navigation steps', () => {
 it('traverses every step and reverses exactly, skipping the hidden lab', () => {
  let state = initialState(deck); const visited = [];
  for (const slide of slides) for (let step = 0; step < slide.cues.length; step++) {
   expect([state.slideId, state.step]).toEqual([slide.id, step]);
   visited.push([slide.id, step]); state = reduce(deck, state, { type: 'next' });
  }
  expect([state.slideId, state.step]).toEqual(visited.at(-1));
  for (const point of visited.reverse()) { expect([state.slideId, state.step]).toEqual(point); state = reduce(deck, state, { type: 'previous' }); }
  expect(reduce(deck, state, { type: 'jump', id: 46 })).toBe(state);
 });
});
describe('workshop break timer', () => {
 it('starts once, continues off-page, pauses without drift, and requires reset after completion', () => {
  let rest = updateRest(initialRest(), 'enter', 1000);
  expect(restRemaining(rest, 61000)).toBe(540000);
  expect(updateRest(rest, 'enter', 71000)).toBe(rest);
  rest = updateRest(rest, 'toggle', 121000);
  expect(restRemaining(rest, 999999)).toBe(480000);
  rest = updateRest(rest, 'toggle', 200000);
  expect(restRemaining(rest, 999999)).toBe(0);
  expect(updateRest(rest, 'toggle', 999999)).toBe(rest);
  rest = updateRest(rest, 'reset', 1000000);
  expect(restRemaining(rest, 9999999)).toBe(600000);
  expect(updateRest(rest, 'enter', 1000001)).toBe(rest);
  expect(updateRest(rest, 'toggle', 1000010).started).toBe(1000010);
 });
});
