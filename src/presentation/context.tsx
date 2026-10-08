import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { progressKey, readProgress, reduce } from './state';
import type { DeckDefinition, NavigationAction, PlaybackRuntime } from './types';

const Context = createContext<PlaybackRuntime | null>(null);

export function PlaybackProvider({ deck, fresh, children }: { deck: DeckDefinition; fresh: boolean; children: ReactNode }) {
  const [state, dispatch] = useReducer(
    (state: PlaybackRuntime['state'], action: NavigationAction) => reduce(deck, state, action),
    null, () => readProgress(deck, fresh),
  );
  useEffect(() => {
    try { sessionStorage.setItem(progressKey(deck.id), JSON.stringify(state)); } catch { /* Playback remains usable with storage disabled. */ }
    // Consume the start signal after initialization, so refreshing during a
    // delayed deck download still starts a new session rather than restoring it.
    if (fresh) {
      const url = new URL(location.href);
      if (url.searchParams.get('start') === '1') {
        url.searchParams.delete('start');
        history.replaceState(history.state, '', url.pathname + url.search + url.hash);
      }
    }
  }, [deck.id, state, fresh]);
  const actions = useMemo(() => ({
    next: () => dispatch({ type: 'next' }), previous: () => dispatch({ type: 'previous' }),
    nextSlide: () => dispatch({ type: 'nextSlide' }), previousSlide: () => dispatch({ type: 'previousSlide' }),
    jump: (id: string | number) => dispatch({ type: 'jump', id }), restart: () => dispatch({ type: 'restart' }),
  }), []);
  const index = deck.slides.findIndex(slide => slide.id === state.slideId);
  const runtime = useMemo(() => ({ deck, state, slide: deck.slides[index], index, actions }), [deck, state, index, actions]);
  return <Context.Provider value={runtime}>{children}</Context.Provider>;
}

export function usePlayback(): PlaybackRuntime {
  const runtime = useContext(Context);
  if (!runtime) throw new Error('usePlayback must be called inside PlaybackProvider.');
  return runtime;
}
