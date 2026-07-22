import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/index.ts',
        'src/browser/semantic-target.ts',
        'src/contracts/create-ui-task-capture.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 85,
        branches: 60,
        statements: 80,
      },
    },
  },
});
