/**
 * This file is part of opsi-webgui.
 * Copyright (c) uib GmbH <info@uib.de>
 * License: AGPL-3.0
 *
 * Playwright E2E test configuration.
 * Tests run against a real opsiconfd backend, no mocks.
 *
 * Usage:
 *   pnpm test:e2e                   # PR/smoke mode (DE, light, desktop, Chromium)
 *   pnpm test:e2e:full              # Full matrix (all locales/themes/viewports, + Firefox + visual regression)
 *   pnpm test:e2e:update-baselines  # Regenerate visual-regression baselines
 *   pnpm screenshots:docs           # Generate documentation/marketing screenshots into ../screenshots/
 *                                   # (full matrix incl. 1920×1080 "marketing" viewport, visual diff skipped)
 */

import { defineConfig, devices } from '@playwright/test'
import { AUTH_FILE } from './e2e/setup/auth.setup'

const isNightly = process.env.CI_PIPELINE_SOURCE === 'schedule'
const baseURL = process.env.BASE_URL || 'https://localhost:3000/addons/webgui/app'
const authFile = AUTH_FILE

export default defineConfig({
  testDir: './e2e/specs',
  outputDir: '../test-results/artifacts',
  globalSetup: './e2e/setup/auth.setup.ts',
  snapshotDir: './e2e/__snapshots__',
  snapshotPathTemplate: '{snapshotDir}/{arg}{ext}',
  reporter: process.env.CI
    ? [
        ['junit', { outputFile: '../test-results/junit.xml' }],
        ['html', { outputFolder: '../test-results/html' }],
        ['list'],
      ]
    : 'list',
  timeout: 90_000,
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
      threshold: 0.2,
    },
  },
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  fullyParallel: false,

  use: {
    baseURL,
    headless: true,
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: authFile },
      testIgnore: /login\.spec/,
    },
    {
      name: 'chromium-login',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /login\.spec/,
    },
    // ...(isNightly
    //   ? [
    //     {
    //       name: 'firefox',
    //       use: { ...devices['Desktop Firefox'], storageState: authFile },
    //       testIgnore: /login\.spec/,
    //     },
    //   ]
    //   : []),
  ],
})
