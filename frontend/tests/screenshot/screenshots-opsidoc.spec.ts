import { test } from '@playwright/test'
import { setupMockRoutes, toggleTheme, selectLanguage, takeFullPageScreenshot, login, logout } from '../shared/utils'

// const themes = ['light', 'dark'] as const
// const languages = ['en', 'de'] as const

const themes = ['light'] as const
const languages = ['en'] as const

test.describe('Screenshots for OpsiDoc', () => {
  for (const theme of themes) {
    test.describe(`${theme.charAt(0).toUpperCase() + theme.slice(1)}`, () => {
      for (const language of languages) {
        test.describe(`${language.toUpperCase()}`, () => {
          //   test('Login Page', async ({ browser }) => {
          //     const { context, page } = await setupMockRoutes(browser, false) // Not logged in
          //     await page.goto('/login', { waitUntil: 'networkidle', timeout: 60000 })
          //     await toggleTheme(page, theme)
          //     // await selectLanguage(page, language)
          //     await page.waitForTimeout(1000)
          //     await takeFullPageScreenshot(page, `screenshots/opsidoc/${theme}/${language}/opsi-webgui-login.png`)
          //     await context.close()
          //   })
          test('Main Pages', async ({ browser }) => {
            const { context, page } = await setupMockRoutes(browser, true) // Logged in
            await page.goto('/login', { waitUntil: 'networkidle', timeout: 60000 })
            await toggleTheme(page, theme)
            //   await selectLanguage(page, language)
            await page.waitForTimeout(1000)
            await login(context, page)

            await takeFullPageScreenshot(page, `screenshots/opsidoc/${theme}/${language}/opsi-webgui-clients.png`)
            await page.goto('/servers/', { waitUntil: 'networkidle', timeout: 60000 })
            await takeFullPageScreenshot(page, `screenshots/opsidoc/${theme}/${language}/opsi-webgui-servers.png`)

            await logout(page)
            await context.close()
          })
        })
      }
    })
  }
})
