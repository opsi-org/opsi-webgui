/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { test } from '@playwright/test'
import {
  setupMockRoutes,
  toggleTheme,
  selectLanguage,
  takeFullPageScreenshot,
} from '../shared/utils'
import { themes, languages } from '../shared/constants'

test.describe('Login Page', () => {
  for (const theme of themes) {
    for (const language of languages) {
      test(`${theme.charAt(0).toUpperCase() + theme.slice(1)} - ${language.toUpperCase()}`, async ({
        page,
      }) => {
        await setupMockRoutes(page, false) // Not logged in
        await page.goto('/login', {
          waitUntil: 'networkidle',
          timeout: 60000,
        })
        await toggleTheme(page, theme)
        // await selectLanguage(page, language)
        await page.waitForTimeout(1000)
        await takeFullPageScreenshot(
          page,
          `screenshots/opsidoc/${theme}/${language}/opsi-webgui-login.png`,
        )
      })
    }
  }
})
