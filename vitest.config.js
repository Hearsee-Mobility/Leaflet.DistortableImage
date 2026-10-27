import {defineConfig} from 'vitest/config';
import {playwright} from '@vitest/browser-playwright';

export default defineConfig({
  // Missing fixtures must 404 rather than fall back to an HTML page
  appType: 'mpa',
  test: {
    globals: true,
    include: ['test/src/**/*Spec.js'],
    setupFiles: ['test/setup.js'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{browser: 'chromium'}],
      testerHtmlPath: 'test/index.html',
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,ts}'],
      reporter: ['text', 'lcovonly', 'html'],
      // Floor at the current numbers; raise as tests are added, never lower
      thresholds: {
        statements: 64,
        branches: 52,
        functions: 65,
        lines: 64,
      },
    },
  },
});
