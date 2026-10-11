import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  fullyParallel: true,
  forbidOnly: isCI,
  // Flake handling: retry only in CI, and keep a trace of the first retry so a
  // flaky test leaves evidence. A test that passes on retry is reported as "flaky".
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  expect: { timeout: 5_000 },
  use: {
    testIdAttribute: 'data-test', // Swag Labs uses data-test, not data-testid
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], baseURL: process.env.UI_BASE_URL ?? 'https://www.saucedemo.com' },
    },
    {
      name: 'ui-webkit',
      testDir: './tests/ui',
      use: { ...devices['Desktop Safari'], baseURL: process.env.UI_BASE_URL ?? 'https://www.saucedemo.com' },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: process.env.API_BASE_URL ?? 'https://restful-booker.herokuapp.com' },
    },
  ],
});
