/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import type { Browser, BrowserContext, Page, Route } from '@playwright/test'
import { defaultResponseHeaders } from '../shared/constants'
import {
  fetchMockData,
  mockData,
  serverId,
  userId,
  serverObjectList,
  clientObjectList,
} from './mocks'

export const getFreshBrowserState = async (
  browser: Browser,
): Promise<{ context: BrowserContext; page: Page }> => {
  const context = await browser.newContext()
  const page = await context.newPage()
  return { context, page }
}

export const addMockRoute = async (
  page: Page,
  url: string,
  response: any,
  headers: Record<string, string> = defaultResponseHeaders,
) => {
  await page.route(url, (route: Route) => {
    route.fulfill({
      status: 200,
      headers,
      contentType: 'application/json',
      body: JSON.stringify(response),
    })
  })
}

export const setupMockRoutes = async (
  browser: Browser, // Accept the browser object
  isLoggedIn: boolean = false,
  customRoutes: Array<{ url: string; response: any }> = [],
): Promise<{ context: BrowserContext; page: Page }> => {
  const { context, page } = await getFreshBrowserState(browser)
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
    await addMockRoute(page, url, response)
  }
  return { context, page }
}

export const toggleTheme = async (
  page: Page,
  targetTheme: 'light' | 'dark',
) => {
  const isLightTheme =
    (await page.getByTestId('theme-switch').getAttribute('aria-checked')) ===
    'false'
  if (
    (targetTheme === 'dark' && isLightTheme) ||
    (targetTheme === 'light' && !isLightTheme)
  ) {
    await page.getByTestId('theme-toggle').click()
  }
}

export const selectLanguage = async (
  page: Page,
  targetLanguage: 'en' | 'de',
) => {
  const currentLanguage = await page
    .getByTestId('language-dropdown')
    .getAttribute('aria-label')
  if (currentLanguage !== targetLanguage) {
    await page.getByTestId('language-dropdown').click()
    await page.getByText(targetLanguage).click()
  }
}

export const takeFullPageScreenshot = async (page: Page, path: string) => {
  await page.screenshot({ path })
}
