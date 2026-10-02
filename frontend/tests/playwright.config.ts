/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 */

/**
 * Playwright E2E config; tests use a real opsiconfd backend.
 */

import { defineConfig, devices } from '@playwright/test'
import { authFileFor } from './e2e/setup/auth.setup'

const isNightly = process.env.CI_PIPELINE_SOURCE === 'schedule'
const baseURL = process.env.BASE_URL || 'https://localhost:3000/addons/webgui/app'
const chromiumAuthFile = authFileFor('chromium')
const firefoxAuthFile = authFileFor('firefox')

export default defineConfig({
  testDir: './e2e/specs',
  outputDir: '../test-results/artifacts',
  globalSetup: './e2e/setup/auth.setup.ts',
  snapshotDir: './e2e/__snapshots__',
  snapshotPathTemplate: '{snapshotDir}/{arg}{ext}',
  reporter: process.env.CI
    ? [['junit', { outputFile: '../test-results/junit.xml' }], ['html', { outputFolder: '../test-results/html' }], ['list']]
    : 'list',
  timeout: isNightly ? 480_000 : 90_000,
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
      threshold: 0.2,
    },
  },
  retries: process.env.CI ? 1 : 0,
  // Allow multiple spec files to run in parallel (tests within each file remain sequential
  // to avoid conflicts on the shared opsiconfd state).
  workers: isNightly ? 4 : 2,
  fullyParallel: false,

  use: {
    baseURL,
    headless: true,
    ignoreHTTPSErrors: true,
    viewport: { width: 1552, height: 920 },
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    // Prevent individual locator actions (click, fill, waitFor…) from hanging
    // indefinitely, especially on Firefox.
    actionTimeout: 30_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: chromiumAuthFile },
      testIgnore: /login\.spec/,
    },
    {
      name: 'chromium-login',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /login\.spec/,
    },
    ...(isNightly
      ? [
          {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'], storageState: firefoxAuthFile },
            testIgnore: /login\.spec/,
          },
          {
            name: 'firefox-login',
            use: { ...devices['Desktop Firefox'] },
            testMatch: /login\.spec/,
          },
        ]
      : []),
  ],
})
