const { test, expect } = require('@playwright/test')
const { apiMock, cookieOpsiconfdSession } = require('../../uib-components/.utils/playwright/pw-api-mock')

// TODO Test 'Failed login' with incorrect credentials
// TODO Check if password hidden by default and Unhide it and check if it shows password
// TODO Login page: expect version, company name, language dropdown, and try changing Language.

test.beforeEach(async ({ page }) => {
  // page.on('console', m => console.log(m.text()))
  // page.on('requestfailed', request => (!request.url().includes('4447')) ? '' : console.log(`>>f ${request.method()} ${request.url()} ${JSON.stringify(request.failure())}`))
  // page.on('request', request => {
  //   if (request.url().includes('4447')) {
  //     console.log(`>> ${request.method()} ${request.url()}`)
  //   }
  // })
  // page.on('response', async response => {
  //   if (response.url().includes('4447')) {
  //     let txt = (await response.body()).toString()
  //     console.log(`<< ${response.status()} ${response.url()} ${txt}`)
  //   }
  // "jest-playwright-preset": "^1.7.0",
  // })
  await page.unroute('**/api/**')
  await apiMock(page, '**/api/user/opsiserver', { result: 'mydepot.uib.local' })
  await apiMock(page, '**/api/auth/login', { result: 'Login success' })
  await apiMock(page, '**/api/auth/logout', { result: 'logout success' })
  await page.goto('./login')
})

// test.afterEach(async ({ page }) => {
//   await page.close()
// })

test('should be possible to login and logout again', async ({ page, context }) => {
  let title = page.locator('[data-testid="login_title"]')
  await expect(title).toHaveText('OPSIWEB')
  title = page.locator('[data-testid="login_configserver"]')
  await expect(title).toHaveAttribute('placeholder', 'mydepot.uib.local')
  await page.type('[placeholder="Username"]', 'adminuser')
  await page.press('[placeholder="Username"]', 'Tab')
  await page.type('[placeholder="Password"]', 'adminuser')
  await page.press('[placeholder="Password"]', 'Enter')
  await context.addCookies(cookieOpsiconfdSession)
  title = await context.cookies()
  expect(title).toEqual(cookieOpsiconfdSession)
  await page.waitForNavigation({ url: './clients/' })
  await apiMock(page, '**/api/auth/logout', { result: 'logout success' }, 'POST')
  await page.click('[data-testid="ButtonBTNLogout"]')
  // await page.waitForNavigation({ url: './login' })
  await page.waitForNavigation()
  page.setDefaultTimeout(55555)
  await expect(page).toHaveURL('/addons/webgui/app/login')
})
