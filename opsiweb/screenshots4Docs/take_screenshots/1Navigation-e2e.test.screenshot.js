const { test, expect } = require('@playwright/test')
const { mockEveryThing } = require('../../uib-components/.utils/playwright/pw-api-mock')
mockEveryThing(test, expect)

test.describe('Navigation', () => {
  // test('test', async ({ page }) => {
  //   await expect(page).toHaveURL('/addons/webgui/app/clients/')
  //   // await page.click('[data-testid="NICollapsible-title.clients"]')
  //   // await page.click('[data-testid="NICollapsible-submenu-title.clientstitle.addNew"]')
  //   await page.getByTestId('NICollapsible-title.clients').click()
  //   await page.getByTestId('NICollapsible-submenu-title.clientstitle.addNew').click()
  //   await expect(page).toHaveURL('/addons/webgui/app/clientscreation')
  // })
  test('en', async ({ page }) => {
    await expect(page).toHaveURL('/addons/webgui/app/clients/')
    await page.click('[data-testid="btnQuickPanel"]:not(.active)')
    await page.click('[data-testid="DropdownDDLang"]')
    await page.click('[data-testid="DropdownDDLang-Item-en"]')
    await page.click('[data-testid="btnQuickPanel"].active')
    await testPages(page, 'en')
  })
  test('de', async ({ page }) => {
    await expect(page).toHaveURL('/addons/webgui/app/clients/')
    await page.click('*[data-testid="btnQuickPanel"]:not(.active)')
    await page.click('[data-testid="DropdownDDLang"]')
    await page.click('[data-testid="DropdownDDLang-Item-de"]')
    await page.click('*[data-testid="btnQuickPanel"].active')
    await testPages(page, 'de')
  })
})

test.describe('Image for Marketing', () => {
  test('de', async ({ page }) => {
    await expect(page).toHaveURL('/addons/webgui/app/clients/')
    // close left sidemenu
    await page.click('[data-testid="BarBSideBtnExpand"].active')
    // open (right) quickpanel
    await page.click('[data-testid="btnQuickPanel"]:not(.active)')
    await (new Promise(resolve => setTimeout(resolve, 500)))
    // change lang to de
    await page.click('[data-testid="DropdownDDLang"]')
    await page.click('[data-testid="DropdownDDLang-Item-de"]')
    // close quick panel
    await page.click('[data-testid="btnQuickPanel"].active')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    // select second clienttable row
    await page.click('tbody>tr:nth-child(2)')
    await page.click('[data-testid="ButtonBTNRowLinkTo"].tableheader_products')
    await (new Promise(resolve => setTimeout(resolve, 3000)))
    await page.screenshot({ path: './screenshots/marketing/opsi-webgui_clientproductspanel_de.png' })
  })
})

const testPages = async (page, lang) => {
  await expect(page).toHaveURL('/addons/webgui/app/clients/')
  await page.click('[data-testid="NICollapsible-title.clients"]')

  await (new Promise(resolve => setTimeout(resolve, 5000))) // after 5 seconds the alert will disappear
  // await page.click('[data-testid="statusAlert"] .close')
  await page.screenshot({ path: './screenshots/new/' + lang + '/opsi-webgui_clients.png' })
  await page.screenshot({ path: './screenshots/' + lang + '/opsi-webgui_mainlayout.png' })

  await page.click('[data-testid="NICollapsible-submenu-title.clientstitle.addNew"]')
  // await (new Promise(resolve => setTimeout(resolve, 1000)))

  await expect(page).toHaveURL('/addons/webgui/app/clientscreation')
  // await expect(page).toHaveURL(/-*\/app\/clientscreation*/)
  await page.screenshot({ path: './screenshots/new/' + lang + '/opsi-webgui_clientcreation.png' })

  // await page.getByTestId('clientname').fill('testclient-' + Math.floor(Math.random() * 10001))
  // ----> changes the local database ! not mocked!
  // await page.getByTestId('addButton').click()
  // if (lang === 'en') { await expect(page.getByTestId('statusAlert')).toContainText('has been added succesfully.') }
  // if (lang === 'de') { await expect(page.getByTestId('statusAlert')).toContainText('erfolgreich') }
  // await page.getByTestId('statusAlert').getByRole('button').click()

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
  // await page.getByText('clientdirectory').click()
  // await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.screenshot({ path: './screenshots/new/' + lang + '/opsi-webgui_groups.png' })

  await page.click('[data-testid="NICollapsible-title.clients"]')
  await expect(page).toHaveURL('/addons/webgui/app/clients/')
}
