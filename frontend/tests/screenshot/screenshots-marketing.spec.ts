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
  login,
} from '../shared/utils'
import { themes, languages } from '../shared/constants'

test.describe('Clients Page with Products', () => {
  for (const theme of themes) {
    for (const language of languages) {
      test(`${theme.charAt(0).toUpperCase() + theme.slice(1)} - ${language.toUpperCase()}`, async ({
        context,
        page,
      }) => {
        await setupMockRoutes(page, true) // Logged in
        await page.goto('/login', {
          waitUntil: 'networkidle',
          timeout: 60000,
        })
        await toggleTheme(page, theme)
        // await selectLanguage(page, language)
        await page.waitForTimeout(1000)
        await login(context, page)

        if (page.url() !== '/clients/') {
          await page.goto('/clients/', {
            waitUntil: 'networkidle',
            timeout: 60000,
          })
        }
        await page.click('[data-testid="clients-products-button"]')
        await takeFullPageScreenshot(
          page,
          `screenshots/marketing/${theme}/${language}/opsi-webgui-clients-with-products.png`,
        )
      })
    }
  }
})
