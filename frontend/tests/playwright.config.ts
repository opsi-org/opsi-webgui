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
  use: {
    baseURL: 'http://localhost:3000',
    browserName: 'chromium',
    headless: true,
    ignoreHTTPSErrors: true,
    viewport: { width: 1440, height: 900 },
  },
})
