import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: { dedupe: ['react', 'react-dom', 'motion'] },
  build: { target: 'es2022' },
});
