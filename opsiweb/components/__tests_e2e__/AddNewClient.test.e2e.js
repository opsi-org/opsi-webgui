
const { test, expect } = require('@playwright/test')
const { apiMock, cookieOpsiconfdSession } = require('../../uib-components/.utils/playwright/pw-api-mock')
test.describe('Client - Create New', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.unroute('**/api/**')
    await apiMock(page, '**/api/user/opsiserver', { result: 'mydepot.uib.local' })
    await apiMock(page, '**/api/auth/login', { result: 'Login success' })
    await apiMock(page, '**/api/auth/logout', { result: 'logout success' })
    await page.goto('./login')
    await page.type('[placeholder="Username"]', 'adminuser')
    await page.press('[placeholder="Username"]', 'Tab')
    await page.type('[placeholder="Password"]', 'adminuser')
    await page.press('[placeholder="Password"]', 'Enter')
    await context.addCookies(cookieOpsiconfdSession)
    const title = await context.cookies()
    expect(title).toEqual(cookieOpsiconfdSession)
    await page.waitForNavigation({ url: './clients/' })
    await page.goto('./clientsaddnew')
  })

  // test.afterEach(async ({ page }) => {
  //   await apiMock(page, '**/api/auth/logout', { result: 'logout success' }, 'POST')
  //   await page.click('[data-testid="ButtonBTNLogout"]')
  //   await page.close()
  // })

  test('Add Button Disabled', async ({ page }) => {
    await expect(page.locator('[data-testid="clientname"]')).toHaveText('')
    const locator = page.locator('#addButton')
    await expect(locator).toBeDisabled()
  })

  // test('create a new opsi client', async ({ page }) => {
  //   // TODO Check if Add button is disabled when no ID.
  //   // TODO Fillout complete form, click on RESET and check if it resets the form
  //   // TODO Check default domain name is from configserver
  //   // TODO Fillout complete form, click on ADD and expect alert, also check clients table and filter by newClients ID.
  //   // TODO: Check with already existing client ID and expect alert
  // })
})
