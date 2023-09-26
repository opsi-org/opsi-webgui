const { test, expect } = require('@playwright/test')
const { apiMock, cookieOpsiconfdSession } = require('../../uib-components/.utils/playwright/pw-api-mock')

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
  apiMock(page, '**/api/user/opsiserver', { result: 'testconfigserver.uib.local' })
  await page.goto('./login')
})

test.afterEach(async ({ page }) => {
  await page.close()
})

test.describe('usecase', () => {
  test('Login and Logout', async ({ page, context }) => {
    apiMock(page, '**/api/auth/login', { result: 'Login success' })
    let title = page.locator('[data-testid="login_title"]')
    // await expect(title).toHaveText('opsi-webgui')
    title = page.locator('[data-testid="login_configserver"]')
    await expect(title).toHaveAttribute('placeholder', 'testconfigserver.uib.local')
    await page.type('[placeholder="Username"]', 'adminuser')
    await page.press('[placeholder="Username"]', 'Tab')
    await page.type('[placeholder="Password"]', 'adminuser')
    await page.press('[placeholder="Password"]', 'Enter')
    await context.addCookies(cookieOpsiconfdSession)
    title = await context.cookies()
    expect(title).toEqual(cookieOpsiconfdSession)
    await expect(page).toHaveURL('/addons/webgui/app/clients/')
    apiMock(page, '**/api/auth/logout', { result: 'logout success' }, 'POST')
    await page.click('[data-testid="ButtonBTNLogout"]')
    page.setDefaultTimeout(55555)
    await expect(page).toHaveURL('/addons/webgui/app/login')
  })
})
// test('Login with incorrect credentials', async ({ page }) => {
//   await expect(page.locator('[data-testid="login_configserver"]')).toHaveAttribute('placeholder', 'testconfigserver.uib.local')
//   await page.type('[placeholder="Username"]', 'adminuser')
//   await page.press('[placeholder="Username"]', 'Tab')
//   await page.type('[placeholder="Password"]', 'adminuser1')
//   await page.press('[placeholder="Password"]', 'Enter')
//   await apiMock(page, '**/api/auth/login', { http_status: 403, error: '', message: 'Opsi service authentication error' })
//   await page.waitForLoadState('networkidle')
//   await page.screenshot({ path: './screenshots/loginFailed.png' })
//   await expect(page.getByTestId('authAlert')).toContainText('Login Failed')
// })
