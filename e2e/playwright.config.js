import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  retries: 1,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  reporter: [['list']],
});
