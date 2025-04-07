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
