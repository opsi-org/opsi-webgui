
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

  test.afterEach(async ({ page }) => {
    // await apiMock(page, '**/api/auth/logout', { result: 'logout success' }, 'POST')
    // await page.click('[data-testid="ButtonBTNLogout"]')
    // await page.waitForNavigation()
    await page.close()
  })

  test('Add Button Disabled', async ({ page }) => {
    const addButton = await page.locator('[data-testid="addButton"]')
    await expect(await addButton.isDisabled()).toBeTruthy()
  })

  test('Default Domain name', async ({ page }) => {
    const domainName = await page.locator('#domainName')
    await expect(domainName).toHaveText('.uib.local')
  })

  test('Show Alert for already existing client', async () => {
  })

  test('Reset form', async ({ page }) => {
    await page.fill('#clientname', 'testclient')
    await page.click('#resetButton')
    await expect(page.locator('#clientname')).toHaveText('')
  })

  test('Create a new client', async () => {
    // TODO Fillout complete form, click on ADD and expect alert, also check clients table and filter by newClients ID.
  })
})
