/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './',
  reporter: 'list',
  timeout: 60000,
  retries: 0,
  fullyParallel: true,
  workers: 4,
  use: {
    baseURL: 'https://localhost:8888/addons/webgui/app',
    browserName: 'chromium',
    headless: true,
    ignoreHTTPSErrors: true,
    // screenshot: 'only-on-failure',
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      args: ['--disable-web-security'],
    },
  },
})
