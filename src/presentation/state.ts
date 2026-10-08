import type { DeckDefinition, NavigationAction, PlaybackState } from './types';

export const progressKey = (id: string) => `slides:${id}:progress`;
export const initialState = (deck: DeckDefinition): PlaybackState => ({
  schema: 1, deckVersion: deck.version ?? 1, slideId: deck.slides[0].id, step: 0, generation: 0,
});

export function reduce(deck: DeckDefinition, state: PlaybackState, action: NavigationAction): PlaybackState {
  const index = deck.slides.findIndex(slide => slide.id === state.slideId);
  const current = deck.slides[index];
  const go = (target: number, last = false) => {
    const slide = deck.slides[target];
    return slide ? { ...state, slideId: slide.id, step: last ? slide.steps - 1 : 0 } : state;
  };
  switch (action.type) {
    case 'next': return state.step < current.steps - 1 ? { ...state, step: state.step + 1 } : go(index + 1);
    case 'previous': return state.step > 0 ? { ...state, step: state.step - 1 } : go(index - 1, true);
    case 'nextSlide': return go(index + 1);
    case 'previousSlide': return go(index - 1);
    case 'jump': return go(deck.slides.findIndex(slide => slide.id === action.id));
    case 'restart': return { ...initialState(deck), generation: state.generation + 1 };
  }
}

export function restore(deck: DeckDefinition, value: unknown): PlaybackState {
  if (!value || typeof value !== 'object') return initialState(deck);
  const state = value as PlaybackState;
  const slide = deck.slides.find(slide => slide.id === state.slideId);
  if (state.schema !== 1 || !slide || !Number.isSafeInteger(state.generation) || state.generation < 0)
    return initialState(deck);
  if (state.deckVersion !== (deck.version ?? 1))
    return { ...initialState(deck), slideId: slide.id, generation: state.generation };
  if (!Number.isInteger(state.step) || state.step < 0 || state.step >= slide.steps) return initialState(deck);
  return { schema: 1, deckVersion: state.deckVersion, slideId: state.slideId, step: state.step, generation: state.generation };
}

export function readProgress(deck: DeckDefinition, fresh: boolean): PlaybackState {
  if (fresh) return initialState(deck);
  try { return restore(deck, JSON.parse(sessionStorage.getItem(progressKey(deck.id)) ?? 'null')); }
  catch { return initialState(deck); }
}
