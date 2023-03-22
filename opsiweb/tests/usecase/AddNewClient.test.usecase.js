
const { test, expect } = require('@playwright/test')
const { apiMock, cookieOpsiconfdSession } = require('../../uib-components/.utils/playwright/pw-api-mock')
test.beforeEach(async ({ page }) => {
  await page.unroute('**/api/**')
  await apiMock(page, '**/api/user/opsiserver', { result: 'mydepot.uib.local' })
  await apiMock(page, '**/api/auth/login', { result: 'Login success' })
  await apiMock(page, '**/api/auth/logout', { result: 'logout success' })
  await page.goto('./login')
})
// test.afterEach(async ({ page }) => {
//   await apiMock(page, '**/api/auth/logout', { result: 'logout success' }, 'POST')
//   await page.click('[data-testid="ButtonBTNLogout"]')
//   await page.waitForNavigation()
//   await page.close()
// }
test('New client creation', async ({ page, context }) => {
  const title = page.locator('[data-testid="login_title"]')
  await expect(title).toHaveText('OPSIWEB')
  const configserver = page.locator('[data-testid="login_configserver"]')
  await expect(configserver).toHaveAttribute('placeholder', 'mydepot.uib.local')
  await page.type('[placeholder="Username"]', 'adminuser')
  await page.press('[placeholder="Username"]', 'Tab')
  await page.type('[placeholder="Password"]', 'adminuser')
  await page.press('[placeholder="Password"]', 'Enter')
  await context.addCookies(cookieOpsiconfdSession)
  const session = await context.cookies()
  expect(session).toEqual(cookieOpsiconfdSession)
  await page.waitForNavigation({ url: './clients/' })
  await expect(page).toHaveURL('/addons/webgui/app/clients/')
  await page.click('[data-testid="NSidebar-title.clients"]')

  // page.setDefaultTimeout(55555)

  await page.click('[data-testid="NICollapsible-submenu-title.addNew"]')
  // await page.waitForNavigation({ url: './clientsaddnew' })
  // page.setDefaultTimeout(55555)
  // await expect(page).toHaveURL('/addons/webgui/app/clientsaddnew')

  const breadcrumb = page.locator('[data-testid="BarBBreadcrumb"]')
  await expect(breadcrumb).toHaveText('Client creation')
  const domainName = page.locator('#domainName')
  await expect(domainName).toHaveText('.uib.local')
  const addButton = page.locator('#addButton')
  await expect(addButton.isDisabled()).toBeTruthy()
  await page.type('#clientname', 'testclient')
  await page.click('#resetButton')
  await expect(page.locator('#clientname')).toHaveText('')
  // TODO Show Alert for already existing client
  // TODO Fillout complete form, click on ADD and expect alert, also check clients table and filter by newClients ID.
})