/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import type { BrowserContext, Page, Route } from '@playwright/test'
import {
  defaultResponseHeaders,
  opsiconfdSessionCookie,
} from '../shared/constants'
import {
  fetchMockData,
  mockData,
  serverId,
  userId,
  serverObjectList,
  clientObjectList,
} from './mocks'

export const setupMockRoutes = async (
  page: Page,
  isLoggedIn: boolean = false,
  customRoutes: Array<{ url: string; response: any }> = [],
) => {
  await fetchMockData()
  await page.unroute('**/api/**')

  const defaultRoutes = [
    { url: '**/webgui/api/**', response: {} },
    { url: '**/api/user/opsiserver', response: { result: serverId } },
    ...(isLoggedIn
      ? [
          { url: '**/api/auth/login', response: { result: 'Login success' } },
          {
            url: '**/api/user/configuration',
            response: { user: userId, configuration: mockData.config_files },
          },
          { url: '**/api/opsidata/server/disabled-features', response: [] },
          {
            url: '**/addons/webgui/api/opsidata/depots?**',
            response: serverObjectList,
          },
          {
            url: '**/addons/webgui/api/opsidata/clients?**',
            response: clientObjectList,
          },
        ]
      : []),
  ]

  const routesToMock = customRoutes.length > 0 ? customRoutes : defaultRoutes
  for (const { url, response } of routesToMock) {
    await page.route(url, (route: Route) => {
      route.fulfill({
        status: 200,
        headers: {
          ...defaultResponseHeaders,
          'x-opsi-worker-id': `${serverId}:1`,
          'x-opsi-user-id': `user:${userId}`,
        },
        contentType: 'application/json',
        body: JSON.stringify(response),
      })
    })
  }
}

export const login = async (context: BrowserContext, page: Page) => {
  await context.addCookies(opsiconfdSessionCookie)
  await context.cookies()
  await page.waitForURL('**/app/**', { timeout: 60000 })
}

export const toggleTheme = async (
  page: Page,
  targetTheme: 'light' | 'dark',
) => {
  const themeToggle = page.getByTestId('theme-toggle')
  await themeToggle.waitFor({ state: 'visible' })
  const ariaLabel = await themeToggle.getAttribute('aria-label')
  const isDarkMode = ariaLabel?.includes('on')
  if (
    (targetTheme === 'dark' && !isDarkMode) ||
    (targetTheme === 'light' && isDarkMode)
  ) {
    await themeToggle.click()
  }
}

export const selectLanguage = async (
  page: Page,
  targetLanguage: 'en' | 'de',
) => {
  const languageDropdown = page.getByTestId('language-dropdown')
  const currentLanguage = await languageDropdown.getAttribute('aria-label')

  if (currentLanguage !== targetLanguage) {
    await languageDropdown.click()
    const languageOption = page.getByTestId(
      `language-dropdown-item-${targetLanguage}`,
    )
    await languageOption.click()
  }
}

export const takeFullPageScreenshot = async (page: Page, path: string) => {
  await page.screenshot({ path })
}
