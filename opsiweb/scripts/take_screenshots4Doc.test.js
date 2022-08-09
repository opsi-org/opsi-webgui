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
  // test('Products', async ({ page }) => {
  //   await callStoryId(page, 'view-v-products', 'v-products')
  //   const component = await page.locator('[data-testid="VProducts"]')
  //   await page.evaluate((val) => { document.querySelector('.nav-title').innerHTML = val }, en['title.products'])
  //   await page.evaluate((val) => { document.querySelector('.tableheader_depots').innerHTML = val }, en['title.depots'])
  //   await page.evaluate((val) => { document.querySelector('.tableheader_hostgroup').innerHTML = val }, en['treeselect.hostGroups'])
  //   await page.evaluate((val) => { document.querySelector('.tableheader_productgroup').innerHTML = val }, en['treeselect.prodGroups'])
  //   await component.evaluate(() => { document.querySelector('.count').innerHTML = '0/3' })
  //   await component.evaluate(() => { document.querySelector('.localboot').innerHTML = 'Localboot(3)' })
  //   await component.evaluate(() => { document.querySelector('.netboot').innerHTML = 'Netboot(7)' })
  //   await component.evaluate(() => { document.querySelector('.filter').placeholder = 'Filter ID' })
  //   await component.screenshot({ path: './screenshots/en/opsiweb_products.png' })
  //   await page.evaluate((val) => { document.querySelector('.nav-title').innerHTML = val }, de['title.products'])
  //   await page.evaluate((val) => { document.querySelector('.tableheader_hostgroup').innerHTML = val }, de['treeselect.hostGroups'])
  //   await page.evaluate((val) => { document.querySelector('.tableheader_productgroup').innerHTML = val }, de['treeselect.prodGroups'])
  //   await component.screenshot({ path: './screenshots/de/opsiweb_products.png' })
  // })
  // test('HostGroups', async ({ page }) => {
  //   await callStoryId(page, 'tree-ts-host-groups', 'ts-host-groups')
  //   await page.click('[data-testid="TSHostGroups"]')
  //   await page.evaluate((val) => { document.querySelector('.vue-treeselect__placeholder').innerHTML = val }, en['treeselect.hostGroups'])
  //   await page.evaluate((val) => { document.querySelector('.clearButton').innerHTML = val }, en['table.selection.clear'])
  //   await page.setViewportSize({ width: 320, height: 210 })
  //   await page.screenshot({ path: './screenshots/en/opsiweb_hostgroups.png' })
  //   await page.evaluate((val) => { document.querySelector('.vue-treeselect__placeholder').innerHTML = val }, de['treeselect.hostGroups'])
  //   await page.evaluate((val) => { document.querySelector('.clearButton').innerHTML = val }, de['table.selection.clear'])
  //   await page.screenshot({ path: './screenshots/de/opsiweb_hostgroups.png' })
  // })
  // test('ProductGroups', async ({ page }) => {
  //   await callStoryId(page, 'tree-ts-product-groups', 'ts-product-group')
  //   await page.click('[data-testid="TSProductGroups"]')
  //   await page.evaluate((val) => { document.querySelector('.vue-treeselect__placeholder').innerHTML = val }, en['treeselect.prodGroups'])
  //   await page.evaluate((val) => { document.querySelector('.clearButton').innerHTML = val }, en['table.selection.clear'])
  //   await page.setViewportSize({ width: 320, height: 180 })
  //   await page.screenshot({ path: './screenshots/en/opsiweb_productgroups.png' })
  //   await page.evaluate((val) => { document.querySelector('.vue-treeselect__placeholder').innerHTML = val }, de['treeselect.prodGroups'])
  //   await page.evaluate((val) => { document.querySelector('.clearButton').innerHTML = val }, de['table.selection.clear'])
  //   await page.screenshot({ path: './screenshots/de/opsiweb_productgroups.png' })
  // })
  // test('Host Configuaration', async ({ page }) => {
  //  TODO Config Button
  //   await page.screenshot({ path: './screenshots/en/opsiweb_hostconfig.png' })
  //   await page.screenshot({ path: './screenshots/de/opsiweb_hostconfig.png' })
  // })
  // test('Host Attributes', async ({ page }) => {
  //   await callStoryId(page, 'view-v-config', 'v-config')
  //   const component = await page.locator('[data-testid="VConfig"]')
  //   await page.evaluate((val) => { document.querySelector('.hostattr').innerHTML = val }, en['title.hostattr'])
  //   await page.evaluate((val) => { document.querySelector('.hostId').setAttribute('data-label', val) }, en['table.fields.id'])
  //   await page.evaluate((val) => { document.querySelector('.type').setAttribute('data-label', val) }, en['table.fields.type'])
  //   await page.evaluate((val) => { document.querySelector('.description').setAttribute('data-label', val) }, en['table.fields.description'])
  //   await page.evaluate((val) => { document.querySelector('.notes').setAttribute('data-label', val) }, en['table.fields.notes'])
  //   await page.evaluate((val) => { document.querySelector('.hwAddr').setAttribute('data-label', val) }, en['table.fields.hwAddr'])
  //   await page.evaluate((val) => { document.querySelector('.ip').setAttribute('data-label', val) }, en['table.fields.ip'])
  //   await page.evaluate((val) => { document.querySelector('.inventNum').setAttribute('data-label', val) }, en['table.fields.inventNum'])
  //   await page.evaluate((val) => { document.querySelector('.created').setAttribute('data-label', val) }, en['table.fields.created'])
  //   await page.evaluate((val) => { document.querySelector('.lastSeen').setAttribute('data-label', val) }, en['table.fields.lastSeen'])
  //   await page.evaluate((val) => { document.querySelector('.hostKey').setAttribute('data-label', val) }, en['table.fields.hostKey'])
  //   await page.evaluate((val) => { document.querySelector('.otp').setAttribute('data-label', val) }, en['table.fields.otp'])
  //   await page.evaluate((val) => { document.querySelector('.uefi').setAttribute('data-label', val) }, en['table.fields.uefi'])
  //   await component.screenshot({ path: './screenshots/en/opsiweb_hostattributes.png' })
  //   await page.evaluate((val) => { document.querySelector('.hostattr').innerHTML = val }, de['title.hostattr'])
  //   await page.evaluate((val) => { document.querySelector('.type').setAttribute('data-label', val) }, de['table.fields.type'])
  //   await page.evaluate((val) => { document.querySelector('.description').setAttribute('data-label', val) }, de['table.fields.description'])
  //   await page.evaluate((val) => { document.querySelector('.notes').setAttribute('data-label', val) }, de['table.fields.notes'])
  //   await page.evaluate((val) => { document.querySelector('.inventNum').setAttribute('data-label', val) }, de['table.fields.inventNum'])
  //   await page.evaluate((val) => { document.querySelector('.created').setAttribute('data-label', val) }, de['table.fields.created'])
  //   await page.evaluate((val) => { document.querySelector('.lastSeen').setAttribute('data-label', val) }, de['table.fields.lastSeen'])
  //   await page.evaluate((val) => { document.querySelector('.hostKey').setAttribute('data-label', val) }, de['table.fields.hostKey'])
  //   await page.evaluate((val) => { document.querySelector('.otp').setAttribute('data-label', val) }, de['table.fields.otp'])
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
  //   await page.evaluate((val) => { document.querySelector('.clientdeletion').innerHTML = val }, en['button.delete'])
  //   await page.evaluate((val) => { document.querySelector('.modal-title').innerHTML = val }, en['title.deleteClient'])
  //   await page.evaluate((val) => { document.querySelector('.confirm').innerHTML = val }, en['message.confirm.deleteClient'])
  //   await page.evaluate((val) => { document.querySelector('.deletion').innerHTML = val }, en['button.delete'])
  //   await page.screenshot({ path: './screenshots/en/opsiweb_clientdeletion.png' })
  //   await page.evaluate((val) => { document.querySelector('.clientdeletion').innerHTML = val }, de['button.delete'])
  //   await page.evaluate((val) => { document.querySelector('.modal-title').innerHTML = val }, de['title.deleteClient'])
  //   await page.evaluate((val) => { document.querySelector('.confirm').innerHTML = val }, de['message.confirm.deleteClient'])
  //   await page.evaluate((val) => { document.querySelector('.deletion').innerHTML = val }, de['button.delete'])
  //   await page.screenshot({ path: './screenshots/de/opsiweb_clientdeletion.png' })
  // })
  test('Client reboot', async ({ page }) => {
  // TODO:
    await callStoryId(page, 'button-btn-event', 'btn-event-reboot')
    await page.click('[data-testid="BTNEvent"] .btn')
    await page.setViewportSize({ width: 750, height: 300 })
    await page.evaluate((val) => { document.querySelector('.eventlabel').innerHTML = val }, en['button.event.reboot'])
    await page.evaluate((val) => { document.querySelector('.modal-title').innerHTML = val }, en['button.event.reboot'])
    await page.evaluate((val) => { document.querySelector('.footer').innerHTML = val }, en['button.event.modal.footer'])
    await page.evaluate((val) => { document.querySelector('.confirm').innerHTML = val }, en['button.confirm'])
    await page.screenshot({ path: './screenshots/en/opsiweb_clientreboot.png' })
    await page.evaluate((val) => { document.querySelector('.eventlabel').innerHTML = val }, de['button.event.reboot'])
    await page.evaluate((val) => { document.querySelector('.modal-title').innerHTML = val }, de['button.event.reboot'])
    await page.evaluate((val) => { document.querySelector('.footer').innerHTML = val }, de['button.event.modal.footer'])
    await page.evaluate((val) => { document.querySelector('.confirm').innerHTML = val }, de['button.confirm'])
    await page.screenshot({ path: './screenshots/de/opsiweb_clientreboot.png' })
  })
  // test('Client logs', async ({ page }) => {
  //   await callStoryId(page, 'view-v-clients-log', 'v-clients-log')
  //   await page.evaluate((val) => { document.querySelector('.filter_logs').placeholder = val }, en['form.filter.logs'])
  //   await page.setViewportSize({ width: 1280, height: 480 })
  //   await page.screenshot({ path: './screenshots/en/opsiweb_clientlogs.png' })
  //   await page.evaluate((val) => { document.querySelector('.filter_logs').placeholder = val }, de['form.filter.logs'])
  //   await page.screenshot({ path: './screenshots/de/opsiweb_clientlogs.png' })
  // })
  // test('Properties and Dependencies', async () => {})
  // test('Quick Save', async ({ page }) => {
  //   await callStoryId(page, 'view-v-settings-local-specific', 'v-settings-local-specific')
  //   const component = await page.locator('[data-testid="quicksave"]')
  //   await page.evaluate((val) => { document.querySelector('.quicksave').innerHTML = val }, en['form.quicksave'])
  //   await component.screenshot({ path: './screenshots/en/opsiweb_quicksave.png' })
  //   await page.evaluate((val) => { document.querySelector('.quicksave').innerHTML = val }, de['form.quicksave'])
  //   await component.screenshot({ path: './screenshots/de/opsiweb_quicksave.png' })
  // })
  // test('Push installations', async ({ page }) => {
  // // TODO:
  //   await callStoryId(page, 'button-btn-event', 'btn-event-on-demand-default')
  //   const component = await page.locator('[data-testid="BTNEvent"]')
  //   await component.isEnabled()
  //   await page.click('[data-testid="BTNEvent"] .btn')
  //   await page.setViewportSize({ width: 750, height: 400 })
  //   await page.screenshot({ path: './screenshots/en/opsiweb_pushinstallations.png' })
  //   await page.screenshot({ path: './screenshots/de/opsiweb_pushinstallations.png' })
  // })
  // test('Selections', async ({ page }) => {
  //   await callStoryId(page, 'modal-m-selections-all', 'm-selections-all')
  //   await page.click('[data-testid="MSelectionsAll"] .btn')
  //   await page.setViewportSize({ width: 750, height: 400 })
  //   await page.evaluate((val) => { document.querySelector('.modal-title').innerHTML = val }, en['title.selectedElements'])
  //   await page.evaluate((val) => { document.querySelector('.depots').innerHTML = val }, en['title.depots'])
  //   await page.evaluate((val) => { document.querySelector('.clients').innerHTML = val }, en['title.clients'])
  //   await page.screenshot({ path: './screenshots/en/opsiweb_selections.png' })
  //   await page.evaluate((val) => { document.querySelector('.modal-title').innerHTML = val }, de['title.selectedElements'])
  //   await page.screenshot({ path: './screenshots/de/opsiweb_selections.png' })
  // })
})
// test.describe('OPSI specific Settings', () => {
//   // TODO: Settings page with Modules content selected
// test('OPSI Modules', async ({ page }) => {
//   await callStoryId(page, 'view-v-modules', 'v-modules')
//   const component = await page.locator('[data-testid="VModules"]')
//   await page.evaluate((val) => { document.querySelector('.modules').innerHTML = val }, en['form.modules.available'])
//   await component.screenshot({ path: './screenshots/en/opsiweb_opsimodules.png' })
//   await page.evaluate((val) => { document.querySelector('.modules').innerHTML = val }, de['form.modules.available'])
//   await component.screenshot({ path: './screenshots/de/opsiweb_opsimodules.png' })
// })
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
