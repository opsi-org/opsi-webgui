const { test, expect } = require('@playwright/test')
const { apiMock, cookieOpsiconfdSession } = require('../../uib-components/.utils/playwright/pw-api-mock')
test.beforeEach(async ({ page, context }) => {
  await page.unroute('**/api/**')
  apiMock(page, '**/api/user/opsiserver', { result: 'testconfigserver.uib.local' })
  await page.goto('./login')
  const title = page.locator('[data-testid="login_title"]')
  await expect(title).toHaveText('opsi-webgui')
  await page.type('[placeholder="Username"]', 'adminuser')
  await page.press('[placeholder="Username"]', 'Tab')
  await page.type('[placeholder="Password"]', 'adminuser')
  await page.press('[placeholder="Password"]', 'Enter')
  apiMock(page, '**/api/auth/login', { result: 'Login success' })
  await context.addCookies(cookieOpsiconfdSession)
  const session = await context.cookies()
  expect(session).toEqual(cookieOpsiconfdSession)
  apiMock(page, '**/api/opsidata/depots/clients?selectedDepots=[testconfigserver.uib.local]', ['client1.uib.local', 'client2.uib.local', 'client3.uib.local', 'client4.uib.local', 'client5.uib.local'])
  apiMock(page, '**/api/opsidata/depot_ids', ['testconfigserver.uib.local', 'depot1.uib.local', 'depot2.uib.local', 'depot3.uib.local'])
  apiMock(page, '**/api/opsidata/clients?pageNumber=1&perPage=15&sortBy=clientId&sortDesc=false&filterQuery=&selected=&selectedDepots=["testconfigserver.uib.local"]&selectedClients=[]', [
    { clientId: 'client1.uib.local', ident: 'client1.uib.local', macAddress: 'af:fe:af:fe:af:f1', description: '', notes: '', version_outdated: 0, installationStatus_unknown: 0, installationStatus_installed: 0, actionResult_failed: 0, actionResult_successful: 0, selected: 0 }
  ])
  await (new Promise(resolve => setTimeout(resolve, 2000)))
  await expect(page).toHaveURL('/addons/webgui/app/clients/')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
})

test.afterEach(async ({ page }) => {
  await apiMock(page, '**/api/auth/logout', { result: 'logout success' }, 'POST')
  await page.click('[data-testid="ButtonBTNLogout"]')
  page.setDefaultTimeout(55555)
  await expect(page).toHaveURL('/addons/webgui/app/login')
  await page.close()
})

// TODO: Currently no products, need a test backend with clients and products
test.describe('Product', () => {
  test('Setup when Quick Save is OFF', async ({ page }) => {
    await page.getByText('testclient').click()
    await page.click('[data-testid="NIItem-title.settings"]')
    await expect(page).toHaveURL('/addons/webgui/app/settings')
    expect(await page.getByTestId('CBQuickSave').isChecked()).toBeTruthy()
    await page.getByTestId('CBQuickSave').check()
    // await page.uncheck('[data-testid="CBQuickSave"]')
    // await page.screenshot({ path: './screenshots/quicksave-off.png' })
    await page.click('[data-testid="NIItem-title.products"]')
    await expect(page).toHaveURL('/addons/webgui/app/products/')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    // await page.screenshot({ path: './screenshots/products.png' })
    const row = page.locator('tr:has-text("activate-win")')
    await row.locator('[data-testid="DropdownDDProductRequest"]').selectOption('setup')
    await expect(page.getByTestId('statusAlert')).toContainText('Product action request has been saved')
    await expect(page.getByTestId('statusAlert')).toHaveClass('alert alertbar alert-dismissible alert-success')
  })
  test('Setup when Quick Save is ON', async ({ page }) => {
    await page.getByText('testclient').click()
    await page.click('[data-testid="NIItem-title.settings"]')
    await expect(page).toHaveURL('/addons/webgui/app/settings')
    await page.getByTestId('CBQuickSave').check()
    // await page.screenshot({ path: './screenshots/quicksave-on.png' })
    await page.click('[data-testid="NIItem-title.products"]')
    await expect(page).toHaveURL('/addons/webgui/app/products/')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    const row = page.locator('tr:has-text("activate-win")')
    await row.locator('[data-testid="DropdownDDProductRequest"]').selectOption('setup')
    await expect(page).toHaveText('Track changes')
  })
})
