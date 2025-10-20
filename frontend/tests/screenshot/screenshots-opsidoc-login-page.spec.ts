/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { test } from '@playwright/test'
import { login, toggleTheme, selectLanguage, takeFullPageScreenshot } from '../shared/utils'
//import { addMockRoute, serverId } from '../shared/mock/mocks'
import { themes, languages } from '../shared/constants'
// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Login Page', () => {
  const theme = 'light'
  const language = 'en'
  //for (const theme of themes)
  {
    //for (const language of languages)
    {
      test.use({ locale: language })
      test.use({ colorScheme: theme })

      test(`${theme.charAt(0).toUpperCase() + theme.slice(1)} - ${language.toUpperCase()}`, async ({
        context,
      }) => {
        const page = await context.newPage()

        await page.goto('login/', {
          waitUntil: 'networkidle',
          timeout: 60000,
        })
        await toggleTheme(page, theme as 'light' | 'dark')
        await selectLanguage(page, language)

        await page.screenshot({
          path: `screenshots/opsidoc/${theme}/${language}/opsi-webgui-login.png`,
          fullPage: true,
        })

        const themeToggle = page.getByTestId('theme-toggle')
        await page.waitForTimeout(500)
        await themeToggle.screenshot({
          path: `screenshots/opsidoc/${theme}/${language}/opsi-webgui-theme.png`,
        })

        const languageDropdown = page.getByTestId('language-dropdown')
        await languageDropdown.click()
        await page.waitForTimeout(500)
        await languageDropdown.screenshot({
          path: `screenshots/opsidoc/${theme}/${language}/opsi-webgui-language.png`,
        })

        /* // actual login
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
        }*/
      })
    }
  }
})
