/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { test } from '@playwright/test'
import { toggleTheme, selectLanguage, takeFullPageScreenshot } from '../shared/utils'
import { addMockRoute, serverId } from '../shared/mock/mocks'
import { themes, languages } from '../shared/constants'

test.describe('Login Page', () => {
  for (const theme of themes) {
    for (const language of languages) {
      test(`${theme.charAt(0).toUpperCase() + theme.slice(1)} - ${language.toUpperCase()}`, async ({
        page,
      }) => {
        await addMockRoute(page, '**/api/user/opsiserver', { result: serverId })
        await page.waitForTimeout(1000)
        await page.goto('/login', {
          waitUntil: 'networkidle',
          timeout: 60000,
        })
        await toggleTheme(page, theme)
        await selectLanguage(page, language)
        await takeFullPageScreenshot(
          page,
          `screenshots/opsidoc/${theme}/${language}/opsi-webgui-login.png`
        )
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
      })
    }
  }
})
