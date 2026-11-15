import type { DeckDefinition } from './presentation';

export type DeckEntry = { id: string; title: string; load: () => Promise<DeckDefinition> };

export const deckEntries: DeckEntry[] = [
  {
    id: 'system-is-all-you-need', title: 'System Is All You Need',
    load: () => import('../decks/System-Is-All-You-Need/deck').then(module => module.systemIsAllYouNeed),
  },
  {
    id: 'mirage', title: 'Mirage',
    load: () => import('../decks/Mirage/deck').then(module => module.mirageDeck),
  },
  {
    id: 'titanfuzz', title: 'TitanFuzz',
    load: () => import('../decks/titanfuzz/deck').then(module => module.titanFuzzDeck),
  },
  {
    id: 'backend-workshop', title: 'Backend Workshop',
    load: () => import('../decks/backend-workshop/src/definition').then(module => module.backendWorkshop),
  },
  // The player test fixture is exercised in browser tests, not published in the collection.
  ...(import.meta.env.MODE === 'test' ? [{
    id: 'example', title: 'A different perspective',
    load: () => import('../tests/fixtures/example/deck').then(module => module.exampleDeck),
  }] : []),
];
