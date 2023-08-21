const { test, expect } = require('@playwright/test')
const { apiMock, cookieOpsiconfdSession } = require('../../uib-components/.utils/playwright/pw-api-mock')

const clientIds = []
const clientObj = []
const rnd = () => { return Math.floor(Math.random() * 11) }
for (let i = 0; i < 19; i++) {
  const id = 'client-' + [i] + 'domain.local'
  clientIds.push(id)
  clientObj.push({ clientId: id, ident: id, macAddress: 'af:fe:af:fe:af:f1', description: '', notes: '', version_outdated: rnd(), installationStatus_unknown: rnd(), installationStatus_installed: rnd(), actionResult_failed: rnd(), actionResult_successful: rnd(), selected: 0 })
}

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
  apiMock(page, '**/api/user/configuration', { user: 'adminuser', configuration: { read_only: false, depot_access: false, host_group_access: false, product_group_access: false, client_creation: false } })
  apiMock(page, '**/api/opsidata/hosts/groups-dynamic?**', { groups: {} })

  apiMock(page, '**/api/opsidata/depot_ids', ['testconfigserver.uib.local', 'depot1.uib.local', 'depot2.uib.local', 'depot3.uib.local'])
  apiMock(page, '**/api/opsidata/depots/clients?selectedDepots=[testconfigserver.uib.local]', clientIds)
  apiMock(page, '**/api/opsidata/clients?**', clientObj)
  await (new Promise(resolve => setTimeout(resolve, 2000)))
  await expect(page).toHaveURL('/addons/webgui/app/clients/')
})

test.afterEach(async ({ page }) => {
  apiMock(page, '**/api/auth/logout', { result: 'logout success' }, 'POST')
  await page.click('[data-testid="ButtonBTNLogout"]')
  page.setDefaultTimeout(55555)
  await expect(page).toHaveURL('/addons/webgui/app/login')
  await page.close()
})

test.describe('Navigation', () => {
  test('en', async ({ page }) => {
    await expect(page).toHaveURL('/addons/webgui/app/clients/')
    await page.click('[data-testid="DropdownDDLang"]')
    await page.click('[data-testid="DropdownDDLang-Item-en"]')
    await testPages(page, 'en')
  })
  test('de', async ({ page }) => {
    await expect(page).toHaveURL('/addons/webgui/app/clients/')
    await page.click('[data-testid="DropdownDDLang"]')
    await page.click('[data-testid="DropdownDDLang-Item-de"]')
    await testPages(page, 'de')
  })
})

const testPages = async (page, lang) => {
  await expect(page).toHaveURL('/addons/webgui/app/clients/')
  await page.click('[data-testid="NICollapsible-title.clients"]')
  await expect(page).toHaveURL('/addons/webgui/app/clients/')
  await (new Promise(resolve => setTimeout(resolve, 5000))) // after 5 seconds the alert will disappear
  // await page.click('[data-testid="statusAlert"] .close')
  await page.screenshot({ path: './screenshots/new/' + lang + '/opsi-webgui_clients.png' })
  await page.screenshot({ path: './screenshots/' + lang + '/opsi-webgui_mainlayout.png' })

  apiMock(page, '**/api/opsidata/hosts/groups/id', ['clientdirectory', 'testgroup', 'test'])
  await page.click('[data-testid="NICollapsible-submenu-title.clientstitle.addNew"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await expect(page).toHaveURL('/addons/webgui/app/clientscreation')
  await page.screenshot({ path: './screenshots/new/' + lang + '/opsi-webgui_clientcreation.png' })

  // apiMock(page, '**/api/opsidata/hosts/groups/id', ['clientdirectory', 'testgroup', 'test'])
  await page.getByTestId('clientname').fill('testclient-' + Math.floor(Math.random() * 10001))
  await page.getByTestId('addButton').click()

  if (lang === 'en') { await expect(page.getByTestId('statusAlert')).toContainText('has been added succesfully.') }
  if (lang === 'de') { await expect(page.getByTestId('statusAlert')).toContainText('erfolgreich') }

  await page.getByTestId('statusAlert').getByRole('button').click()

  // apiMock(page, '**/api/opsidata/hosts/groups/id', ['clientdirectory', 'testgroup', 'test'])
  await page.click('[data-testid="NICollapsible-submenu-title.clientstitle.config"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await expect(page).toHaveURL('/addons/webgui/app/clientsconfig')
  await page.screenshot({ path: './screenshots/new/' + lang + '/opsi-webgui_clientconfig.png' })

  // await page.click('[data-testid="NICollapsible-title.clients"]')
  await page.click('[data-testid="NICollapsible-title.depots"]')
  await expect(page).toHaveURL('/addons/webgui/app/depots/')
  await (new Promise(resolve => setTimeout(resolve, 3000)))
  await page.screenshot({ path: './screenshots/new/' + lang + '/opsi-webgui_servers.png' })

  // await page.click('[data-testid="NICollapsible-title.clients"]')
  await page.click('[data-testid="NICollapsible-submenu-title.depotstitle.config"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await expect(page).toHaveURL('/addons/webgui/app/depotsconfig')
  await page.screenshot({ path: './screenshots/new/' + lang + '/opsi-webgui_serverconfig.png' })

  // await page.click('[data-testid="NICollapsible-title.clients"]')
  await page.click('[data-testid="NIItem-title.products"]')
  await (new Promise(resolve => setTimeout(resolve, 3000)))
  await expect(page).toHaveURL('/addons/webgui/app/products/')
  await page.screenshot({ path: './screenshots/new/' + lang + '/opsi-webgui_products.png' })

  // await page.click('[data-testid="NICollapsible-title.clients"]')
  await page.click('[data-testid="NIItem-title.groups"]')
  await expect(page).toHaveURL('/addons/webgui/app/groups/')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.getByText('clientdirectory').click()
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.screenshot({ path: './screenshots/new/' + lang + '/opsi-webgui_groups.png' })
}
