import type { ComponentType, ReactNode } from 'react';

export type SlideId = string | number;
export type SlideDefinition = { id: SlideId; title: string; steps: number };
export type NavigationAction =
  | { type: 'next' | 'previous' | 'nextSlide' | 'previousSlide' | 'restart' }
  | { type: 'jump'; id: SlideId };
export type PlaybackState = {
  schema: 1; deckVersion: number; slideId: SlideId; step: number; generation: number;
};
export type PresentationActions = {
  next: () => void; previous: () => void; nextSlide: () => void; previousSlide: () => void;
  jump: (id: SlideId) => void; restart: () => void;
};
export type SlideRenderProps = {
  slide: SlideDefinition; step: number; mode: 'playback' | 'preview';
  still: boolean; active: boolean; reducedMotion: boolean; actions: PresentationActions;
};
export type TransitionDefinition = {
  name: string;
  animate: (layers: { incoming: HTMLElement; outgoing: HTMLElement }, direction: -1 | 1) => Animation | Animation[];
};
export type PlaybackRuntime = {
  deck: DeckDefinition; state: PlaybackState; slide: SlideDefinition;
  index: number; actions: PresentationActions;
};
export type StageOverlayProps = PlaybackRuntime & {
  viewport: { width: number; height: number }; scale: number;
};
export type DeckDefinition = {
  id: string; title: string; version?: number; description?: string;
  size: { width: number; height: number };
  slides: readonly SlideDefinition[];
  previews: readonly { slideId: SlideId; step?: number }[];
  RenderSlide: ComponentType<SlideRenderProps>;
  chapters?: readonly { id: string; title: string; slideId: SlideId }[];
  handout?: { title: string; href: string };
  transition?: TransitionDefinition | false;
  /** Set for decks whose page poses should land immediately and animate only on manual steps. */
  freezeEntranceOnNavigation?: boolean;
  reserveWidth?: (slide: SlideDefinition, viewport: { width: number; height: number }) => number;
  Overlay?: ComponentType<StageOverlayProps>;
  Provider?: ComponentType<{ children: ReactNode; fresh: boolean }>;
  Controls?: ComponentType<PlaybackRuntime>;
  Help?: ComponentType;
};

/** Content and visuals belong to the deck; this contract only describes playback. */
export function defineDeck<T extends DeckDefinition>(deck: T): T {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(deck.id)) throw new Error('Deck IDs must be URL-safe slugs.');
  if (!deck.slides.length || new Set(deck.slides.map(slide => slide.id)).size !== deck.slides.length)
    throw new Error(`Deck ${deck.id} needs slides with unique IDs.`);
  if (!Number.isFinite(deck.size.width) || !Number.isFinite(deck.size.height) || deck.size.width <= 0 || deck.size.height <= 0)
    throw new Error(`Deck ${deck.id} needs a positive stage size.`);
  for (const slide of deck.slides) if (!Number.isInteger(slide.steps) || slide.steps < 1)
    throw new Error(`Slide ${slide.id} needs at least one step.`);
  for (const preview of deck.previews) {
    const slide = deck.slides.find(slide => slide.id === preview.slideId);
    if (!slide || (preview.step !== undefined && (!Number.isInteger(preview.step) || preview.step < 0 || preview.step >= slide.steps)))
      throw new Error(`Invalid preview in deck ${deck.id}.`);
  }
  return deck;
}
