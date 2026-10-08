import type { DeckDefinition } from './presentation';

export type DeckEntry = { id: string; title: string; load: () => Promise<DeckDefinition> };

export const deckEntries: DeckEntry[] = [
  {
    id: 'backend-workshop', title: 'Backend Workshop',
    load: () => import('../Backend Workhsop/src/definition').then(module => module.backendWorkshop),
  },
  {
    id: 'template', title: 'Template',
    load: () => import('../decks/template/deck').then(module => module.templateDeck),
  },
  {
    id: 'template-editorial', title: 'Editorial',
    load: () => import('../decks/editorial/deck').then(module => module.editorialDeck),
  },
  {
    id: 'template-signal', title: 'Signal',
    load: () => import('../decks/signal/deck').then(module => module.signalDeck),
  },
  {
    id: 'template-prism', title: 'Prism',
    load: () => import('../decks/prism/deck').then(module => module.prismDeck),
  },
  {
    id: 'template-atlas', title: 'Atlas',
    load: () => import('../decks/atlas/deck').then(module => module.atlasDeck),
  },
  // The authoring example is exercised in browser tests, not published in the collection.
  ...(import.meta.env.MODE === 'test' ? [{
    id: 'example', title: 'A different perspective',
    load: () => import('../decks/example/deck').then(module => module.exampleDeck),
  }] : []),
];
