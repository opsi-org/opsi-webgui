import { defineConfig } from '@playwright/test'
import config from './playwright.config'

export default defineConfig({
  ...config,
  globalSetup: undefined,
  testMatch: '**/button-actions.spec.ts',
  outputDir: '../test-results/button-actions',
  workers: 1,
  use: { ...config.use, baseURL: process.env.BASE_URL || 'http://localhost:3000/addons/webgui/app' },
  projects: ['light', 'dark'].flatMap((colorScheme) =>
    ['desktop', 'mobile'].map((viewport) => ({
      name: `${viewport}-${colorScheme}`,
      use: {
        browserName: 'chromium' as const,
        colorScheme: colorScheme as 'light' | 'dark',
        viewport: viewport === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
      },
    })),
  ),
})
