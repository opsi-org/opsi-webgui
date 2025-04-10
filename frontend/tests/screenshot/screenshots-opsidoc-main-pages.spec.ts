/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { test } from '@playwright/test'
import {
  toggleTheme,
  selectLanguage,
  takeFullPageScreenshot,
  login,
  selectHost,
  connectTerminal,
} from '../shared/utils'
import { setupMockRoutes } from '../shared/mock/mocks'
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
        await selectLanguage(page, language)
        await login(context, page)

        if (page.url() !== '/clients') {
          await page.goto('/clients/', {
            waitUntil: 'networkidle',
            timeout: 60000,
          })
        }
        await takeFullPageScreenshot(
          page,
          `screenshots/opsidoc/${theme}/${language}/opsi-webgui-clients.png`,
        )

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
          `screenshots/opsidoc/${theme}/${language}/opsi-webgui-main-layout.png`,
        )

        await page.goto('/servers/', {
          waitUntil: 'networkidle',
          timeout: 60000,
        })
        await takeFullPageScreenshot(
          page,
          `screenshots/opsidoc/${theme}/${language}/opsi-webgui-servers.png`,
        )
        await page.goto('/servers/config', {
          waitUntil: 'networkidle',
          timeout: 60000,
        })
        await selectHost(page)
        await takeFullPageScreenshot(
          page,
          `screenshots/opsidoc/${theme}/${language}/opsi-webgui-servers-config.png`,
        )
        await page.goto('/clients/create', {
          waitUntil: 'networkidle',
          timeout: 60000,
        })
        await takeFullPageScreenshot(
          page,
          `screenshots/opsidoc/${theme}/${language}/opsi-webgui-clients-create.png`,
        )
        await page.goto('/clients/clone', {
          waitUntil: 'networkidle',
          timeout: 60000,
        })
        await takeFullPageScreenshot(
          page,
          `screenshots/opsidoc/${theme}/${language}/opsi-webgui-clients-clone.png`,
        )
        await page.goto('/clients/config', {
          waitUntil: 'networkidle',
          timeout: 60000,
        })
        await selectHost(page)
        const pageNavBreadcrumb = page.getByTestId('page-nav-breadcrumb')
        await pageNavBreadcrumb.screenshot({
          path: `screenshots/opsidoc/${theme}/${language}/opsi-webgui-breadcrumb.png`,
        })
        await takeFullPageScreenshot(
          page,
          `screenshots/opsidoc/${theme}/${language}/opsi-webgui-clients-config.png`,
        )

        await page.goto('/products/LocalbootProduct', {
          waitUntil: 'networkidle',
          timeout: 60000,
        })
        await page.waitForTimeout(10000)
        await takeFullPageScreenshot(
          page,
          `screenshots/opsidoc/${theme}/${language}/opsi-webgui-products.png`,
        )
        await page.goto('/groups/', {
          waitUntil: 'networkidle',
          timeout: 60000,
        })
        await takeFullPageScreenshot(
          page,
          `screenshots/opsidoc/${theme}/${language}/opsi-webgui-groups.png`,
        )

        await page.goto('/admin/diagnostics?id=health', {
          waitUntil: 'networkidle',
          timeout: 60000,
        })
        await takeFullPageScreenshot(
          page,
          `screenshots/opsidoc/${theme}/${language}/opsi-webgui-admin-health-check.png`,
        )
        await page.goto('/admin/diagnostics?id=all', {
          waitUntil: 'networkidle',
          timeout: 60000,
        })
        await page.waitForTimeout(10000)
        await takeFullPageScreenshot(
          page,
          `screenshots/opsidoc/${theme}/${language}/opsi-webgui-admin-diagnostics.png`,
        )
        await page.goto('/admin/terminal', {
          waitUntil: 'networkidle',
          timeout: 60000,
        })
        await connectTerminal(page)
        await takeFullPageScreenshot(
          page,
          `screenshots/opsidoc/${theme}/${language}/opsi-webgui-admin-terminal.png`,
        )
      })
    }
  }
})
