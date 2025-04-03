import { defineConfig } from '@playwright/test'

export default defineConfig({
  use: {
    baseURL: 'https://localhost:8888/addons/webgui/app',
    browserName: 'chromium',
    headless: true,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 720 },
    launchOptions: {
      args: ['--disable-web-security'],
    },
  },
  testDir: './tests',
  reporter: 'list',
  timeout: 60000,
  fullyParallel: true,
  workers: 4,
})
