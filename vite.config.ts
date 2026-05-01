import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      thresholds: {
        statements: 58,
        branches: 48,
        functions: 44,
        lines: 59,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('firebase/')) {
            return 'firebase';
          }

          if (id.includes('@google/generative-ai')) {
            return 'google-ai';
          }

          if (id.includes('framer-motion')) {
            return 'motion';
          }

          if (id.includes('react-router')) {
            return 'router';
          }

          return 'vendor';
        },
      },
    },
  },
});
