const { test } = require('@playwright/test')
const { callStoryId } = require('../uib-components/.utils/playwright/pw-story-call')
const en = require('../uib-components/locale/en.json')
const de = require('../uib-components/locale/de.json')

// TODO: Default layout with client page
// test.describe('Main layout', () => {})
// test.describe('Quick Start', () => {
//   test('Login', async ({ page }) => {
//     await callStoryId(page, 'form-f-login', 'f-login')
//     const component = await page.locator('[data-testid="FLogin"]')
//     await component.evaluate(() => { document.querySelector('.projectTitle').innerHTML = 'OPSIWEB' })
//     await page.evaluate((val) => { document.querySelector('.username').placeholder = val }, en['form.username'])
//     await page.evaluate((val) => { document.querySelector('.password').placeholder = val }, en['form.password'])
//     await page.evaluate((val) => { document.querySelector('.login').innerHTML = val }, en['button.login'])
//     await component.screenshot({ path: './screenshots/en/opsiweb_login.png' })
//     await page.evaluate((val) => { document.querySelector('.username').placeholder = val }, de['form.username'])
//     await page.evaluate((val) => { document.querySelector('.password').placeholder = val }, de['form.password'])
//     await page.evaluate((val) => { document.querySelector('.login').innerHTML = val }, de['button.login'])
//     await component.screenshot({ path: './screenshots/de/opsiweb_login.png' })
//   })
//   test('Client creation', async ({ page }) => {
//     await callStoryId(page, 'view-v-clients-add-new', 'v-clients-add-new')
//     const component = await page.locator('[data-testid="VClientsAddNew"]')
//     await page.evaluate((val) => { document.querySelector('.id').innerHTML = val }, en['table.fields.id'])
//     await component.evaluate(() => { document.querySelector('.domainName').placeholder = '.domain.local' })
//     await page.evaluate((val) => { document.querySelector('.clientDetails').innerHTML = val }, en['table.clientDetails'])
//     await page.evaluate((val) => { document.querySelector('.description').innerHTML = val }, en['table.fields.description'])
//     await page.evaluate((val) => { document.querySelector('.inventNum').innerHTML = val }, en['table.fields.inventNum'])
//     await page.evaluate((val) => { document.querySelector('.hwAddr').innerHTML = val }, en['table.fields.hwAddr'])
//     await page.evaluate((val) => { document.querySelector('.ip').innerHTML = val }, en['table.fields.ip'])
//     await page.evaluate((val) => { document.querySelector('.addtnlInfo').innerHTML = val }, en['table.addtnlInfo'])
//     await page.evaluate((val) => { document.querySelector('.notes').innerHTML = val }, en['table.fields.notes'])
//     await page.evaluate((val) => { document.querySelector('.uefi').innerHTML = val }, en['table.fields.uefi'])
//     await page.evaluate((val) => { document.querySelector('.resetButton').innerHTML = val }, en['button.reset'])
//     await page.evaluate((val) => { document.querySelector('.addButton').innerHTML = val }, en['button.add'])
//     await component.screenshot({ path: './screenshots/en/opsiweb_clientcreation.png' })
//     await page.evaluate((val) => { document.querySelector('.description').innerHTML = val }, de['table.fields.description'])
//     await page.evaluate((val) => { document.querySelector('.inventNum').innerHTML = val }, de['table.fields.inventNum'])
//     await page.evaluate((val) => { document.querySelector('.addtnlInfo').innerHTML = val }, de['table.addtnlInfo'])
//     await page.evaluate((val) => { document.querySelector('.notes').innerHTML = val }, de['table.fields.notes'])
//     await page.evaluate((val) => { document.querySelector('.resetButton').innerHTML = val }, de['button.reset'])
//     await page.evaluate((val) => { document.querySelector('.addButton').innerHTML = val }, de['button.add'])
//     await component.screenshot({ path: './screenshots/de/opsiweb_clientcreation.png' })
//   })
// })
test.describe('Manage', () => {
  // test('Servers', async ({ page }) => {
  //   await callStoryId(page, 'view-v-depots', 'v-depots')
  //   const component = await page.locator('[data-testid="VDepots"]')
  //   await page.evaluate((val) => { document.querySelector('.nav-title').innerHTML = val }, en['title.depots'])
  //   await component.evaluate(() => { document.querySelector('.count').innerHTML = '1/7' })
  //   await component.evaluate(() => { document.querySelector('.filter').placeholder = 'Filter ID' })
  //   await component.screenshot({ path: './screenshots/en/opsiweb_servers.png' })
  //   await component.screenshot({ path: './screenshots/de/opsiweb_servers.png' })
  // })
  // test('Clients', async ({ page }) => {
  //   await callStoryId(page, 'view-v-clients', 'v-clients')
  //   const component = await page.locator('[data-testid="VClients"]')
  //   await page.evaluate((val) => { document.querySelector('.nav-title').innerHTML = val }, en['title.clients'])
  //   await page.evaluate((val) => { document.querySelector('.tableheader_depots').innerHTML = val }, en['title.depots'])
  //   await page.evaluate((val) => { document.querySelector('.tableheader_hostgroup').innerHTML = val }, en['treeselect.hostGroups'])
  //   await page.evaluate((val) => { document.querySelector('.tableheader_products').innerHTML = val }, en['title.products'])
  //   await component.evaluate(() => { document.querySelector('.count').innerHTML = '0/5' })
  //   await component.evaluate(() => { document.querySelector('.filter').placeholder = 'Filter ID' })
  //   await component.screenshot({ path: './screenshots/en/opsiweb_clients.png' })
  //   await page.evaluate((val) => { document.querySelector('.tableheader_hostgroup').innerHTML = val }, de['treeselect.hostGroups'])
  //   await page.evaluate((val) => { document.querySelector('.tableheader_products').innerHTML = val }, de['title.products'])
  //   await component.screenshot({ path: './screenshots/de/opsiweb_clients.png' })
  // })
  test('Products', async ({ page }) => {
    await callStoryId(page, 'view-v-products', 'v-products')
    const component = await page.locator('[data-testid="VProducts"]')
    await page.evaluate((val) => { document.querySelector('.nav-title').innerHTML = val }, en['title.products'])
    await page.evaluate((val) => { document.querySelector('.tableheader_depots').innerHTML = val }, en['title.depots'])
    await page.evaluate((val) => { document.querySelector('.tableheader_hostgroup').innerHTML = val }, en['treeselect.hostGroups'])
    await page.evaluate((val) => { document.querySelector('.tableheader_productgroup').innerHTML = val }, en['treeselect.prodGroups'])
    await component.evaluate(() => { document.querySelector('.count').innerHTML = '0/3' })
    await component.evaluate(() => { document.querySelector('.localboot').innerHTML = 'Localboot(3)' })
    await component.evaluate(() => { document.querySelector('.netboot').innerHTML = 'Netboot(7)' })
    await component.evaluate(() => { document.querySelector('.filter').placeholder = 'Filter ID' })
    await component.screenshot({ path: './screenshots/en/opsiweb_products.png' })
    await page.evaluate((val) => { document.querySelector('.nav-title').innerHTML = val }, de['title.products'])
    await page.evaluate((val) => { document.querySelector('.tableheader_hostgroup').innerHTML = val }, de['treeselect.hostGroups'])
    await page.evaluate((val) => { document.querySelector('.tableheader_productgroup').innerHTML = val }, de['treeselect.prodGroups'])
    await component.screenshot({ path: './screenshots/de/opsiweb_products.png' })
  })
  // test('HostGroups', async ({ page }) => {
  //   await callStoryId(page, 'tree-ts-host-groups', 'ts-host-groups')
  //   await page.click('[data-testid="TSHostGroups"]')
  //   const component = await page.locator('[data-testid="TSHostGroups"]')
  //   await component.evaluate(() => { document.querySelector('.vue-treeselect__placeholder').innerHTML = 'Hostgroups' })
  //   await component.evaluate(() => { document.querySelector('.clearButton').innerHTML = 'Clear selection' })
  //   await page.setViewportSize({ width: 320, height: 210 })
  //   await page.screenshot({ path: './screenshots/en/opsiweb_hostgroups.png' })
  //   await component.evaluate(() => { document.querySelector('.vue-treeselect__placeholder').innerHTML = 'Hostgruppen' })
  //   await component.evaluate(() => { document.querySelector('.clearButton').innerHTML = 'Markierungen entfernen' })
  //   await page.screenshot({ path: './screenshots/de/opsiweb_hostgroups.png' })
  // })
  // test('ProductGroups', async ({ page }) => {
  //   await callStoryId(page, 'tree-ts-product-groups', 'ts-product-group')
  //   await page.click('[data-testid="TSProductGroups"]')
  //   const component = await page.locator('[data-testid="TSProductGroups"]')
  //   await component.evaluate(() => { document.querySelector('.vue-treeselect__placeholder').innerHTML = 'Productgroups' })
  //   await component.evaluate(() => { document.querySelector('.clearButton').innerHTML = 'Clear selection' })
  //   await page.setViewportSize({ width: 320, height: 210 })
  //   await page.screenshot({ path: './screenshots/en/opsiweb_productgroups.png' })
  //   await component.evaluate(() => { document.querySelector('.vue-treeselect__placeholder').innerHTML = 'Produktgruppen' })
  //   await component.evaluate(() => { document.querySelector('.clearButton').innerHTML = 'Markierungen entfernen' })
  //   await page.screenshot({ path: './screenshots/de/opsiweb_productgroups.png' })
  // })
  // test('Host Configuaration', async ({ page }) => {
  //  TODO
  //   await page.screenshot({ path: './screenshots/en/opsiweb_hostconfig.png' })
  //   await page.screenshot({ path: './screenshots/de/opsiweb_hostconfig.png' })
  // })
  // test('Host Attributes', async ({ page }) => {
  //   await callStoryId(page, 'view-v-config', 'v-config')
  //   const component = await page.locator('[data-testid="VConfig"]')
  //   await component.evaluate(() => { document.querySelector('.hostattr').innerHTML = 'Host Attributes' })
  //   await component.evaluate(() => { document.querySelector('.hostId').setAttribute('data-label', 'ID') })
  //   await component.evaluate(() => { document.querySelector('.type').setAttribute('data-label', 'Type') })
  //   await component.evaluate(() => { document.querySelector('.description').setAttribute('data-label', 'Description') })
  //   await component.evaluate(() => { document.querySelector('.notes').setAttribute('data-label', 'Notes') })
  //   await component.evaluate(() => { document.querySelector('.hwAddr').setAttribute('data-label', 'MAC') })
  //   await component.evaluate(() => { document.querySelector('.ip').setAttribute('data-label', 'IP') })
  //   await component.evaluate(() => { document.querySelector('.inventNum').setAttribute('data-label', 'Inventory Number') })
  //   await component.evaluate(() => { document.querySelector('.created').setAttribute('data-label', 'Created') })
  //   await component.evaluate(() => { document.querySelector('.lastSeen').setAttribute('data-label', 'Last Seen') })
  //   await component.evaluate(() => { document.querySelector('.hostKey').setAttribute('data-label', 'OPSI Host Key') })
  //   await component.evaluate(() => { document.querySelector('.otp').setAttribute('data-label', 'One Time Password') })
  //   await component.evaluate(() => { document.querySelector('.uefi').setAttribute('data-label', 'UEFI') })
  //   await component.screenshot({ path: './screenshots/en/opsiweb_hostattributes.png' })
  //   await component.evaluate(() => { document.querySelector('.hostattr').innerHTML = 'Host-Attribute' })
  //   await component.evaluate(() => { document.querySelector('.type').setAttribute('data-label', 'Typ') })
  //   await component.evaluate(() => { document.querySelector('.description').setAttribute('data-label', 'Beschreibung') })
  //   await component.evaluate(() => { document.querySelector('.notes').setAttribute('data-label', 'Anmerkungen') })
  //   await component.evaluate(() => { document.querySelector('.inventNum').setAttribute('data-label', 'Inventar Nummer') })
  //   await component.evaluate(() => { document.querySelector('.created').setAttribute('data-label', 'Erstellt') })
  //   await component.evaluate(() => { document.querySelector('.lastSeen').setAttribute('data-label', 'Zuletzt gesehen') })
  //   await component.evaluate(() => { document.querySelector('.hostKey').setAttribute('data-label', 'OPSI-Hostschlüssel') })
  //   await component.evaluate(() => { document.querySelector('.otp').setAttribute('data-label', 'Einmalpasswort OTP') })
  //   await component.screenshot({ path: './screenshots/de/opsiweb_hostattributes.png' })
  // })
  // test('Client Actions', async ({ page }) => {
  //  TODO
  //   await page.screenshot({ path: './screenshots/en/opsiweb_clientactions.png' })
  //   await page.screenshot({ path: './screenshots/de/opsiweb_clientactions.png' })
  // })
  // test('Client deletion', async ({ page }) => {
  //   await callStoryId(page, 'modal-m-delete-client', 'm-delete-client')
  //   await page.click('[data-testid="MDeleteClient"] .btn')
  //   await page.setViewportSize({ width: 750, height: 200 })
  //   await page.evaluate(() => { document.querySelector('.clientdeletion').innerHTML = 'Delete' })
  //   await page.evaluate(() => { document.querySelector('.modal-title').innerHTML = 'Delete Client' })
  //   await page.evaluate(() => { document.querySelector('.confirm').innerHTML = 'Are you sure you want to delete the client client1.domain.local ?' })
  //   await page.evaluate(() => { document.querySelector('.deletion').innerHTML = 'Delete' })
  //   await page.screenshot({ path: './screenshots/en/opsiweb_clientdeletion.png' })
  //   await page.evaluate(() => { document.querySelector('.clientdeletion').innerHTML = 'Löschen' })
  //   await page.evaluate(() => { document.querySelector('.modal-title').innerHTML = 'Client löschen' })
  //   await page.evaluate(() => { document.querySelector('.confirm').innerHTML = 'Möchten Sie den Client client1.domain.local wirklich löschen? ' })
  //   await page.evaluate(() => { document.querySelector('.deletion').innerHTML = 'Löschen' })
  //   await page.screenshot({ path: './screenshots/de/opsiweb_clientdeletion.png' })
  // })
  // test('Client reboot', async ({ page }) => {
  // TODO:
  //   await callStoryId(page, 'button-btn-event', 'btn-event')
  //   await page.click('[data-testid="BTNEvent"] .btn')
  //   await page.screenshot({ path: './screenshots/en/opsiweb_pushinstallations.png' })
  //   await page.screenshot({ path: './screenshots/de/opsiweb_pushinstallations.png' })
  // })
  // })
  // test('Client logs', async ({ page }) => {
  //   await callStoryId(page, 'view-v-clients-log', 'v-clients-log')
  //   const component = await page.locator('[data-testid="VClientsLog"]')
  //   await component.evaluate(() => { document.querySelector('.filter_logs').placeholder = 'Filter logs' })
  //   await page.setViewportSize({ width: 1280, height: 500 })
  //   await page.screenshot({ path: './screenshots/en/opsiweb_clientlogs.png' })
  //   await component.evaluate(() => { document.querySelector('.filter_logs').placeholder = 'Logs filtern' })
  //   await page.screenshot({ path: './screenshots/de/opsiweb_clientlogs.png' })
  // })
  // test('Properties and Dependencies', async () => {})
  // test('Quick Save', async ({ page }) => {
  //   await callStoryId(page, 'view-v-settings-local-specific', 'v-settings-local-specific')
  //   const component = await page.locator('[data-testid="quicksave"]')
  //   await component.evaluate(() => { document.querySelector('.quicksave').innerHTML = 'Quick save' })
  //   await component.screenshot({ path: './screenshots/en/opsiweb_quicksave.png' })
  //   await component.evaluate(() => { document.querySelector('.quicksave').innerHTML = 'Sofort speichern' })
  //   await component.screenshot({ path: './screenshots/de/opsiweb_quicksave.png' })
  // })
  // test('Push installations', async ({ page }) => {
  // TODO:
  //   await callStoryId(page, 'button-btn-event', 'btn-event')
  //   await page.click('[data-testid="BTNEvent"] .btn')
  //   await page.screenshot({ path: './screenshots/en/opsiweb_pushinstallations.png' })
  //   await page.screenshot({ path: './screenshots/de/opsiweb_pushinstallations.png' })
  // })
  // test('Selections', async ({ page }) => {
  //   await callStoryId(page, 'modal-m-selections-all', 'm-selections-all')
  //   await page.click('[data-testid="MSelectionsAll"] .btn')
  //   await page.setViewportSize({ width: 750, height: 400 })
  //   await page.evaluate(() => { document.querySelector('.modal-title').innerHTML = 'Selected elements' })
  //   await page.evaluate(() => { document.querySelector('.depots').innerHTML = 'Servers' })
  //   await page.evaluate(() => { document.querySelector('.clients').innerHTML = 'Clients' })
  //   await page.screenshot({ path: './screenshots/en/opsiweb_selections.png' })
  //   await page.evaluate(() => { document.querySelector('.modal-title').innerHTML = 'Ausgewählte Elemente' })
  //   await page.screenshot({ path: './screenshots/de/opsiweb_selections.png' })
  // })
})
// test.describe('OPSI specific Settings', () => {
//   // TODO: Settings page with Modules content selected
//   test('OPSI Modules', async ({ page }) => {
//     await callStoryId(page, 'view-v-modules', 'v-modules')
//     const component = await page.locator('[data-testid="VModules"]')
//     await component.evaluate(() => { document.querySelector('.modules').innerHTML = 'Available modules' })
//     await component.screenshot({ path: './screenshots/en/opsiweb_opsiModules.png' })
//     await component.evaluate(() => { document.querySelector('.modules').innerHTML = 'Verfügbare Module' })
//     await component.screenshot({ path: './screenshots/de/opsiweb_opsiModules.png' })
//   })
// })
// test.describe('GUI Settings', () => {
//   test('Language', async ({ page }) => {
//     await callStoryId(page, 'dropdown-dd-lang', 'dd-lang')
//     const component = await page.locator('[data-testid="DropdownDDLang"]')
//     await component.click()
//     await page.setViewportSize({ width: 220, height: 150 })
//     await page.screenshot({ path: './screenshots/en/opsiweb_language.png' })
//     await page.screenshot({ path: './screenshots/de/opsiweb_language.png' })
//   })
//   test('Theme', async ({ page }) => {
//     // TODO: Main layout in dark theme
//     await callStoryId(page, 'dropdown-dd-theme', 'dd-theme')
//     await page.click('[data-testid="DropdownDDTheme"] .btn')
//     await page.setViewportSize({ width: 220, height: 150 })
//     await page.screenshot({ path: './screenshots/en/opsiweb_theme.png' })
//     await page.screenshot({ path: './screenshots/de/opsiweb_theme.png' })
//   })
// })

// test.describe('GUI', () => {
//   test.describe('Page content', () => {
//     test('breadcrumb', async ({ page }) => {
//       await callStoryId(page, 'bar-b-breadcrumb', 'b-breadcrumb')
//       const component = await page.locator('[data-testid="BarBBreadcrumb"]')
//       await component.evaluate(() => { document.querySelector('.breadcrumb').innerHTML = 'Server / Configuration' })
//       await component.screenshot({ path: './screenshots/en/opsiweb_breadcrumb.png' })
//       await component.evaluate(() => { document.querySelector('.breadcrumb').innerHTML = 'Server / Konfiguration' })
//       await component.screenshot({ path: './screenshots/de/opsiweb_breadcrumb.png' })
//     })
//     test('header', async ({ page }) => {
//       await callStoryId(page, 'bar-b-collapse-page-header', 'b-collapse-page-header')
//       const component = await page.locator('[data-testid="BarBCollapsePageHeader"]')
//       await component.evaluate(() => { document.querySelector('.nav-title').innerHTML = 'Clients' })
//       await component.evaluate(() => { document.querySelector('.tableheader_depots').innerHTML = 'Server' })
//       await component.evaluate(() => { document.querySelector('.tableheader_hostgroup').innerHTML = 'Hostgroups' })
//       await component.evaluate(() => { document.querySelector('.tableheader_products').innerHTML = 'Products' })
//       await component.screenshot({ path: './screenshots/en/opsiweb_header.png' })
//       await component.evaluate(() => { document.querySelector('.tableheader_hostgroup').innerHTML = 'Hostgruppen' })
//       await component.evaluate(() => { document.querySelector('.tableheader_products').innerHTML = 'Produkte' })
//       await component.screenshot({ path: './screenshots/de/opsiweb_header.png' })
//     })
//   })
//   test.describe('Table', () => {
//     test('filter', async ({ page }) => {
//       await callStoryId(page, 'input-i-filter', 'i-filter')
//       const component = await page.locator('[data-testid="IFilter"]')
//       await component.type('Filter ID')
//       await component.screenshot({ path: './screenshots/en/opsiweb_table_filter.png' })
//       await component.screenshot({ path: './screenshots/de/opsiweb_table_filter.png' })
//     })
//     test('sorting', async ({ page }) => {
//       await callStoryId(page, 'dropdown-dd-table-sorting', 'dd-table-sorting')
//       await page.click('[data-testid="DropdownDDTableSorting"] .btn')
//       await page.setViewportSize({ width: 220, height: 310 })
//       const component = await page.locator('[data-testid="DropdownDDTableSorting"]')
//       await component.evaluate(() => { document.querySelector('.sortDirection').innerHTML = 'Sort descending' })
//       await page.screenshot({ path: './screenshots/en/opsiweb_table_sorting.png' })
//       await component.evaluate(() => { document.querySelector('.sortDirection').innerHTML = 'Absteigende Sortierung' })
//       await page.screenshot({ path: './screenshots/de/opsiweb_table_sorting.png' })
//     })
//     test('column selection', async ({ page }) => {
//       await callStoryId(page, 'dropdown-dd-table-column-visibility', 'dd-table-column-visibility')
//       await page.click('[data-testid="DropdownDDTableColumnVisibility"] .btn')
//       await page.setViewportSize({ width: 220, height: 210 })
//       await page.screenshot({ path: './screenshots/en/opsiweb_table_columnselection.png' })
//       await page.screenshot({ path: './screenshots/de/opsiweb_table_columnselection.png' })
//     })
//     test('pagination', async ({ page }) => {
//       await callStoryId(page, 'bar-b-table-footer', 'b-table-footer')
//       const component = await page.locator('[data-testid="BTableFooter"]')
//       await component.screenshot({ path: './screenshots/en/opsiweb_table_pagination.png' })
//       await component.screenshot({ path: './screenshots/de/opsiweb_table_pagination.png' })
//     })
//   })
// })
