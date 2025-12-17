import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['lib/*.js', 'validate-scripts.js', 'help.js'],
      exclude: ['**/*.test.js', '**/*.spec.js', '__tests__/**'],
    },
  },
});