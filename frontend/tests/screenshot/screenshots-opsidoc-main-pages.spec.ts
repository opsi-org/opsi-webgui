import { test } from '@playwright/test'
import {
  setupMockRoutes,
  toggleTheme,
  selectLanguage,
  takeFullPageScreenshot,
  login,
} from '../shared/utils'
import { themes, languages } from '../shared/constants'

test.describe('Main Pages', () => {
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

        await takeFullPageScreenshot(
          page,
          `screenshots/opsidoc/${theme}/${language}/opsi-webgui-clients.png`,
        )
        await page.goto('/servers/', {
          waitUntil: 'networkidle',
          timeout: 60000,
        })
        await takeFullPageScreenshot(
          page,
          `screenshots/opsidoc/${theme}/${language}/opsi-webgui-servers.png`,
        )
      })
    }
  }
})
