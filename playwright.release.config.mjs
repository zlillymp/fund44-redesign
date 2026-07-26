import { defineConfig, devices } from '@playwright/test';

const port = 4174;

export default defineConfig({
  testDir: './tests/release',
  timeout: 30_000,
  fullyParallel: false,
  retries: 0,
  outputDir: 'test-results/release',
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report/release' }],
  ],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4174',
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 1024 },
      },
    },
    {
      name: 'mobile-chromium',
      use: {
        browserName: 'chromium',
        ...devices['Pixel 5'],
      },
    },
  ],
});
