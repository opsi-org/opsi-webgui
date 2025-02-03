/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { expect, type BrowserContext, type Page } from '@playwright/test'
import { apiMock, cookieOpsiconfdSession } from './pw-api-mock'

export const pageLogin = async (
  page: Page,
  context: BrowserContext,
  mockFn: (() => void) | undefined = undefined,
  checkFn: ((page: Page) => Promise<void>) | undefined = undefined,
  username = 'adminuser',
  password = 'adminuser',
) => {
  await page.unroute('**/webgui/api/**')
  await apiMock(page, '**/webgui/api/**', {})

  await apiMock(page, '**/api/user/opsiserver', {
    result: 'testconfigserver.uib.local',
  })
  await apiMock(page, '**/api/auth/login', { result: 'Login success' })
  await apiMock(
    page,
    '**/api/auth/logout',
    { result: 'logout success' },
    'POST',
  )
  await page.goto('./login')
  if (mockFn) mockFn()

  await expect(
    page.locator('[data-testid="login_configserver"]'),
  ).toHaveAttribute('placeholder', 'testconfigserver.uib.local')
  await page.fill('[data-testid="login_username"]', username)
  await page.press('[data-testid="login_username"]', 'Tab')
  await page.fill('[data-testid="login_password"]', password)
  await page.press('[data-testid="login_password"]', 'Enter')

  if (checkFn) await checkFn(page)
  else {
    const cookie = Object.freeze(cookieOpsiconfdSession)
    await context.addCookies(cookie)
    await context.cookies()
    await expect(page).toHaveURL('/addons/webgui/app/clients')
  }
  // await new Promise(resolve => setTimeout(resolve, 1000))
}

export const pageLogout = async (page: Page) => {
  await page.click('[data-testid="menu-quickpanel"]') // opening quickpanel only needed for mobile view

  await page.click('[data-testid="ButtonBTNLogout"]')
  // wait 5ms for the button to appear
  await new Promise((r) => setTimeout(r, 500))

  // search for confirm logout button
  const btnLogout = await page.getByRole('button', {
    name: 'button.logout.confirm',
  })

  await expect(btnLogout).toHaveText('button.logout.confirm')
  await btnLogout.click()
  page.setDefaultTimeout(55555)
  await expect(page).toHaveURL('/addons/webgui/app/login')
}
