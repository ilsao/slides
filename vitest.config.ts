import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['tests/*.test.ts', 'decks/backend-workshop/tests/*.test.ts'] },
});
