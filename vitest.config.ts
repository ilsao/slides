import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['tests/*.test.ts', 'Backend Workhsop/tests/*.test.ts'] },
});
