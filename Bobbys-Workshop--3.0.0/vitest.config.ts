// Vitest configuration
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '*.config.{js,ts}',
        'scripts/',
        'server/'
      ]
    },
    include: ['tests/**/*.test.{js,ts}'],
    testTimeout: 10000
  }
});
