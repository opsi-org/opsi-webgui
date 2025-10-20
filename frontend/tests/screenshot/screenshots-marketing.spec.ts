/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { test } from '@playwright/test'
import {
  useHighResolutionViewport,
  toggleTheme,
  selectLanguage,
  login,
  takeFullPageScreenshot,
} from '../shared/utils'
//import { setupMockRoutes } from '../shared/mock/mocks'
import { themes, languages } from '../shared/constants'

test.describe('Clients Page with Products', () => {
  useHighResolutionViewport()
  for (const theme of themes) {
    for (const language of languages) {
      test(`${theme.charAt(0).toUpperCase() + theme.slice(1)} - ${language.toUpperCase()}`, async ({
        context,
        page,
      }) => {
        //await setupMockRoutes(page, true) // Logged in
        await page.goto('login', {
          waitUntil: 'networkidle',
          timeout: 60000,
        })
        await toggleTheme(page, theme)
        await selectLanguage(page, language)
        await login(page)

        if (!page.url().includes('clients')) {
          await page.goto('clients/', {
            waitUntil: 'networkidle',
            timeout: 60000,
          })
          await page.waitForLoadState('networkidle')
          await page.waitForTimeout(10000)
          if (!page.url().includes('clients')) {
            throw new Error('Failed to navigate to clients page')
          }
        }
        await page.waitForSelector('[data-testid="clients-products-button"]', {
          state: 'visible',
        })
        await page.click('[data-testid="clients-products-button"]')
        await page.waitForURL('**/clients/products/**', {
          waitUntil: 'networkidle',
          timeout: 60000,
        })
        await page.waitForTimeout(10000)
        await takeFullPageScreenshot(
          page,
          `screenshots/marketing/${theme}/${language}/opsi-webgui-clients-with-products.png`
        )
      })
    }
  }
})
