const { test } = require('@playwright/test')
const { callStoryId } = require('../uib-components/.utils/playwright/pw-story-call')
const en = require('../uib-components/locale/en.json')
const de = require('../uib-components/locale/de.json')

test.describe.configure({ mode: 'parallel' })

test.describe('Main layout', () => {
//   test('Main Layout in Light Theme', async ({ page }) => {
//     // TODO: Main layout in light theme
//     await page.screenshot({ path: './screenshots/en/opsiweb_mainlayout_light.png' })
//     await page.screenshot({ path: './screenshots/de/opsiweb_mainlayout_light.png' })
//   })
})
test.describe('Quick Start', () => {
  test('Login', async ({ page }) => {
    await callStoryId(page, 'form-f-login', 'f-login')
    const component = await page.locator('[data-testid="FLogin"]')
    await component.evaluate(() => { document.querySelector('.projectTitle').innerHTML = 'OPSIWEB' })
    await page.evaluate((val) => { document.querySelector('.username').placeholder = val }, en['form.username'])
    await page.evaluate((val) => { document.querySelector('.password').placeholder = val }, en['form.password'])
    await page.evaluate((val) => { document.querySelector('.login').innerHTML = val }, en['button.login'])
    await component.screenshot({ path: './screenshots/en/opsiweb_login.png' })
    await page.evaluate((val) => { document.querySelector('.username').placeholder = val }, de['form.username'])
    await page.evaluate((val) => { document.querySelector('.password').placeholder = val }, de['form.password'])
    await page.evaluate((val) => { document.querySelector('.login').innerHTML = val }, de['button.login'])
    await component.screenshot({ path: './screenshots/de/opsiweb_login.png' })
  })
  test('Client creation', async ({ page }) => {
    await callStoryId(page, 'view-v-clients-add-new', 'v-clients-add-new')
    const component = await page.locator('[data-testid="VClientsAddNew"]')
    await page.evaluate((val) => { document.querySelector('.id').innerHTML = val }, en['table.fields.id'])
    await component.evaluate(() => { document.querySelector('.domainName').placeholder = '.domain.local' })
    await page.evaluate((val) => { document.querySelector('.clientDetails').innerHTML = val }, en['table.clientDetails'])
    await page.evaluate((val) => { document.querySelector('.description').innerHTML = val }, en['table.fields.description'])
    await page.evaluate((val) => { document.querySelector('.inventNum').innerHTML = val }, en['table.fields.inventNum'])
    await page.evaluate((val) => { document.querySelector('.hwAddr').innerHTML = val }, en['table.fields.hwAddr'])
    await page.evaluate((val) => { document.querySelector('.ip').innerHTML = val }, en['table.fields.ip'])
    await page.evaluate((val) => { document.querySelector('.addtnlInfo').innerHTML = val }, en['table.addtnlInfo'])
    await page.evaluate((val) => { document.querySelector('.notes').innerHTML = val }, en['table.fields.notes'])
    await page.evaluate((val) => { document.querySelector('.uefi').innerHTML = val }, en['table.fields.uefi'])
    await page.evaluate((val) => { document.querySelector('.resetButton').innerHTML = val }, en['button.reset'])
    await page.evaluate((val) => { document.querySelector('.addButton').innerHTML = val }, en['button.add'])
    await component.screenshot({ path: './screenshots/en/opsiweb_clientcreation.png' })
    await page.evaluate((val) => { document.querySelector('.description').innerHTML = val }, de['table.fields.description'])
    await page.evaluate((val) => { document.querySelector('.inventNum').innerHTML = val }, de['table.fields.inventNum'])
    await page.evaluate((val) => { document.querySelector('.addtnlInfo').innerHTML = val }, de['table.addtnlInfo'])
    await page.evaluate((val) => { document.querySelector('.notes').innerHTML = val }, de['table.fields.notes'])
    await page.evaluate((val) => { document.querySelector('.resetButton').innerHTML = val }, de['button.reset'])
    await page.evaluate((val) => { document.querySelector('.addButton').innerHTML = val }, de['button.add'])
    await component.screenshot({ path: './screenshots/de/opsiweb_clientcreation.png' })
  })
})
test.describe('Manage', () => {
  test('Servers', async ({ page }) => {
    await callStoryId(page, 'view-v-depots', 'v-depots')
    const component = await page.locator('[data-testid="VDepots"]')
    await page.evaluate((val) => { document.querySelector('.nav-title').innerHTML = val }, en['title.depots'])
    await component.evaluate(() => { document.querySelector('.count').innerHTML = '1/7' })
    await component.evaluate(() => { document.querySelector('.filter').placeholder = 'Filter ID' })
    await component.screenshot({ path: './screenshots/en/opsiweb_servers.png' })
    await component.screenshot({ path: './screenshots/de/opsiweb_servers.png' })
  })
  test('Clients', async ({ page }) => {
    await callStoryId(page, 'view-v-clients', 'v-clients')
    const component = await page.locator('[data-testid="VClients"]')
    await page.evaluate((val) => { document.querySelector('.nav-title').innerHTML = val }, en['title.clients'])
    await page.evaluate((val) => { document.querySelector('.tableheader_depots').innerHTML = val }, en['title.depots'])
    await page.evaluate((val) => { document.querySelector('.tableheader_hostgroup').innerHTML = val }, en['treeselect.hostGroups'])
    await page.evaluate((val) => { document.querySelector('.tableheader_products').innerHTML = val }, en['title.products'])
    await component.evaluate(() => { document.querySelector('.count').innerHTML = '0/5' })
    await component.evaluate(() => { document.querySelector('.filter').placeholder = 'Filter ID' })
    await component.screenshot({ path: './screenshots/en/opsiweb_clients.png' })
    await page.evaluate((val) => { document.querySelector('.tableheader_hostgroup').innerHTML = val }, de['treeselect.hostGroups'])
    await page.evaluate((val) => { document.querySelector('.tableheader_products').innerHTML = val }, de['title.products'])
    await component.screenshot({ path: './screenshots/de/opsiweb_clients.png' })
  })
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
  test('HostGroups', async ({ page }) => {
    await callStoryId(page, 'tree-ts-host-groups', 'ts-host-groups')
    await page.click('[data-testid="TSHostGroups"]')
    await page.evaluate((val) => { document.querySelector('.vue-treeselect__placeholder').innerHTML = val }, en['treeselect.hostGroups'])
    await page.evaluate((val) => { document.querySelector('.clearButton').innerHTML = val }, en['table.selection.clear'])
    await page.setViewportSize({ width: 320, height: 210 })
    await page.screenshot({ path: './screenshots/en/opsiweb_hostgroups.png' })
    await page.evaluate((val) => { document.querySelector('.vue-treeselect__placeholder').innerHTML = val }, de['treeselect.hostGroups'])
    await page.evaluate((val) => { document.querySelector('.clearButton').innerHTML = val }, de['table.selection.clear'])
    await page.screenshot({ path: './screenshots/de/opsiweb_hostgroups.png' })
  })
  test('ProductGroups', async ({ page }) => {
    await callStoryId(page, 'tree-ts-product-groups', 'ts-product-group')
    await page.click('[data-testid="TSProductGroups"]')
    await page.evaluate((val) => { document.querySelector('.vue-treeselect__placeholder').innerHTML = val }, en['treeselect.prodGroups'])
    await page.evaluate((val) => { document.querySelector('.clearButton').innerHTML = val }, en['table.selection.clear'])
    await page.setViewportSize({ width: 320, height: 180 })
    await page.screenshot({ path: './screenshots/en/opsiweb_productgroups.png' })
    await page.evaluate((val) => { document.querySelector('.vue-treeselect__placeholder').innerHTML = val }, de['treeselect.prodGroups'])
    await page.evaluate((val) => { document.querySelector('.clearButton').innerHTML = val }, de['table.selection.clear'])
    await page.screenshot({ path: './screenshots/de/opsiweb_productgroups.png' })
  })
  test('Button Config', async ({ page }) => {
    await callStoryId(page, 'button-btn-row-link-to', 'btn-row-link-to-config')
    const component = await page.locator('[data-testid="ButtonBTNRowLinkTo"]')
    await component.screenshot({ path: './screenshots/en/opsiweb_buttonconfig.png' })
    await component.screenshot({ path: './screenshots/de/opsiweb_buttonconfig.png' })
  })
  test('Host Attributes', async ({ page }) => {
    await callStoryId(page, 'view-v-config', 'v-config')
    const component = await page.locator('[data-testid="VConfig"]')
    await page.evaluate((val) => { document.querySelector('.hostattr').innerHTML = val }, en['title.hostattr'])
    await page.evaluate((val) => { document.querySelector('.hostId').setAttribute('data-label', val) }, en['table.fields.id'])
    await page.evaluate((val) => { document.querySelector('.type').setAttribute('data-label', val) }, en['table.fields.type'])
    await page.evaluate((val) => { document.querySelector('.description').setAttribute('data-label', val) }, en['table.fields.description'])
    await page.evaluate((val) => { document.querySelector('.notes').setAttribute('data-label', val) }, en['table.fields.notes'])
    await page.evaluate((val) => { document.querySelector('.hwAddr').setAttribute('data-label', val) }, en['table.fields.hwAddr'])
    await page.evaluate((val) => { document.querySelector('.ip').setAttribute('data-label', val) }, en['table.fields.ip'])
    await page.evaluate((val) => { document.querySelector('.inventNum').setAttribute('data-label', val) }, en['table.fields.inventNum'])
    await page.evaluate((val) => { document.querySelector('.created').setAttribute('data-label', val) }, en['table.fields.created'])
    await page.evaluate((val) => { document.querySelector('.lastSeen').setAttribute('data-label', val) }, en['table.fields.lastSeen'])
    await page.evaluate((val) => { document.querySelector('.hostKey').setAttribute('data-label', val) }, en['table.fields.hostKey'])
    await page.evaluate((val) => { document.querySelector('.otp').setAttribute('data-label', val) }, en['table.fields.otp'])
    await page.evaluate((val) => { document.querySelector('.uefi').setAttribute('data-label', val) }, en['table.fields.uefi'])
    await component.screenshot({ path: './screenshots/en/opsiweb_hostattributes.png' })
    await page.evaluate((val) => { document.querySelector('.hostattr').innerHTML = val }, de['title.hostattr'])
    await page.evaluate((val) => { document.querySelector('.type').setAttribute('data-label', val) }, de['table.fields.type'])
    await page.evaluate((val) => { document.querySelector('.description').setAttribute('data-label', val) }, de['table.fields.description'])
    await page.evaluate((val) => { document.querySelector('.notes').setAttribute('data-label', val) }, de['table.fields.notes'])
    await page.evaluate((val) => { document.querySelector('.inventNum').setAttribute('data-label', val) }, de['table.fields.inventNum'])
    await page.evaluate((val) => { document.querySelector('.created').setAttribute('data-label', val) }, de['table.fields.created'])
    await page.evaluate((val) => { document.querySelector('.lastSeen').setAttribute('data-label', val) }, de['table.fields.lastSeen'])
    await page.evaluate((val) => { document.querySelector('.hostKey').setAttribute('data-label', val) }, de['table.fields.hostKey'])
    await page.evaluate((val) => { document.querySelector('.otp').setAttribute('data-label', val) }, de['table.fields.otp'])
    await component.screenshot({ path: './screenshots/de/opsiweb_hostattributes.png' })
  })
  test('Button Client Actions', async ({ page }) => {
    await callStoryId(page, 'dropdown-dd-client-actions', 'dd-client-actions')
    const component = await page.locator('[data-testid="DDClientActions"]')
    await component.screenshot({ path: './screenshots/en/opsiweb_buttonclientactions.png' })
    await component.screenshot({ path: './screenshots/de/opsiweb_buttonclientactions.png' })
  })
  test('Client deletion', async ({ page }) => {
    await callStoryId(page, 'modal-m-delete-client', 'm-delete-client')
    await page.click('[data-testid="MDeleteClient"] .btn')
    await page.setViewportSize({ width: 750, height: 200 })
    await page.evaluate((val) => { document.querySelector('.clientdeletion').innerHTML = val }, en['button.delete'])
    await page.evaluate((val) => { document.querySelector('.modal-title').innerHTML = val }, en['title.deleteClient'])
    await page.evaluate((val) => { document.querySelector('.confirm').innerHTML = val }, en['message.confirm.deleteClient'])
    await page.evaluate((val) => { document.querySelector('.deletion').innerHTML = val }, en['button.delete'])
    await page.screenshot({ path: './screenshots/en/opsiweb_clientdeletion.png' })
    await page.evaluate((val) => { document.querySelector('.clientdeletion').innerHTML = val }, de['button.delete'])
    await page.evaluate((val) => { document.querySelector('.modal-title').innerHTML = val }, de['title.deleteClient'])
    await page.evaluate((val) => { document.querySelector('.confirm').innerHTML = val }, de['message.confirm.deleteClient'])
    await page.evaluate((val) => { document.querySelector('.deletion').innerHTML = val }, de['button.delete'])
    await page.screenshot({ path: './screenshots/de/opsiweb_clientdeletion.png' })
  })
  test('Client reboot', async ({ page }) => {
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
  test('Button Client Log', async ({ page }) => {
    await callStoryId(page, 'button-btn-row-link-to', 'btn-row-link-to-log')
    const component = await page.locator('[data-testid="ButtonBTNRowLinkTo"]')
    await component.screenshot({ path: './screenshots/en/opsiweb_buttonclientlog.png' })
    await component.screenshot({ path: './screenshots/de/opsiweb_buttonclientlog.png' })
  })
  test('Client logs', async ({ page }) => {
    await callStoryId(page, 'view-v-clients-log', 'v-clients-log')
    await page.evaluate((val) => { document.querySelector('.filter_logs').placeholder = val }, en['form.filter.logs'])
    await page.setViewportSize({ width: 1280, height: 480 })
    await page.screenshot({ path: './screenshots/en/opsiweb_clientlogs.png' })
    await page.evaluate((val) => { document.querySelector('.filter_logs').placeholder = val }, de['form.filter.logs'])
    await page.screenshot({ path: './screenshots/de/opsiweb_clientlogs.png' })
  })
  test('Product Properties', async ({ page }) => {
    await callStoryId(page, 'view-v-product-property', 'v-product-property')
    const component = await page.locator('[data-testid="VProductProperty"]')
    await page.setViewportSize({ width: 1280, height: 300 })
    await page.evaluate((val) => { document.querySelector('.nav-title').innerHTML = val }, en['title.config'])
    await page.evaluate((val) => { document.querySelector('.property').innerHTML = val }, en['title.properties'])
    await page.evaluate((val) => { document.querySelector('.dependency').innerHTML = val }, en['title.dependencies'])
    await page.evaluate((val) => { document.querySelector('.noClientsSelectedShowDepot').innerHTML = val }, en['message.warning.noClientsSelectedShowDepot'])
    await page.evaluate((val) => { document.querySelector('.notOnEachDepot').innerHTML = val }, en['message.warning.notOnEachDepot'])
    await component.screenshot({ path: './screenshots/en/opsiweb_productproperties.png' })
    await page.evaluate((val) => { document.querySelector('.nav-title').innerHTML = val }, de['title.config'])
    await page.evaluate((val) => { document.querySelector('.property').innerHTML = val }, de['title.properties'])
    await page.evaluate((val) => { document.querySelector('.dependency').innerHTML = val }, de['title.dependencies'])
    await page.evaluate((val) => { document.querySelector('.noClientsSelectedShowDepot').innerHTML = val }, de['message.warning.noClientsSelectedShowDepot'])
    await page.evaluate((val) => { document.querySelector('.notOnEachDepot').innerHTML = val }, de['message.warning.notOnEachDepot'])
    await component.screenshot({ path: './screenshots/de/opsiweb_productproperties.png' })
  })
  test('Product Dependencies', async ({ page }) => {
    await callStoryId(page, 'view-v-product-property', 'v-product-property')
    await page.click('.nav-tabs .nav-link:not(.active)')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    const component = await page.locator('[data-testid="VProductProperty"]')
    await page.setViewportSize({ width: 1280, height: 350 })
    await page.evaluate((val) => { document.querySelector('.nav-title').innerHTML = val }, en['title.config'])
    await page.evaluate((val) => { document.querySelector('.property').innerHTML = val }, en['title.properties'])
    await page.evaluate((val) => { document.querySelector('.dependency').innerHTML = val }, en['title.dependencies'])
    await page.evaluate((val) => { document.querySelector('.required').innerHTML = val }, en['table.fields.required'])
    await page.evaluate((val) => { document.querySelector('.type').innerHTML = val }, en['table.fields.requiredType'])
    await page.evaluate((val) => { document.querySelector('.tdtype').innerHTML = val }, en['table.fields.pre-required'])
    await component.screenshot({ path: './screenshots/en/opsiweb_productdependencies.png' })
    await page.evaluate((val) => { document.querySelector('.nav-title').innerHTML = val }, de['title.config'])
    await page.evaluate((val) => { document.querySelector('.property').innerHTML = val }, de['title.properties'])
    await page.evaluate((val) => { document.querySelector('.dependency').innerHTML = val }, de['title.dependencies'])
    await page.evaluate((val) => { document.querySelector('.required').innerHTML = val }, de['table.fields.required'])
    await page.evaluate((val) => { document.querySelector('.type').innerHTML = val }, de['table.fields.requiredType'])
    await page.evaluate((val) => { document.querySelector('.tdtype').innerHTML = val }, de['table.fields.pre-required'])
    await component.screenshot({ path: './screenshots/de/opsiweb_productdependencies.png' })
  })
  test('Quick Save', async ({ page }) => {
    await callStoryId(page, 'view-v-settings-local-specific', 'v-settings-local-specific')
    await page.evaluate((val) => { document.querySelector('.quicksave').innerHTML = val }, en['form.quicksave'])
    await page.screenshot({
      path: './screenshots/en/opsiweb_quicksave.png',
      clip: {
        x: 5,
        y: 55,
        width: 330,
        height: 60
      }
    })
    await page.evaluate((val) => { document.querySelector('.quicksave').innerHTML = val }, de['form.quicksave'])
    await page.screenshot({
      path: './screenshots/de/opsiweb_quicksave.png',
      clip: {
        x: 5,
        y: 55,
        width: 330,
        height: 60
      }
    })
  })
  test('Push installations', async ({ page }) => {
    await callStoryId(page, 'button-btn-event', 'btn-event-on-demand-default')
    await page.click('[data-testid="BTNEvent"] .btn')
    await page.setViewportSize({ width: 750, height: 350 })
    await page.evaluate((val) => { document.querySelector('.eventlabel').innerHTML = val }, en['button.event.ondemand'])
    await page.evaluate((val) => { document.querySelector('.modal-title').innerHTML = val }, en['button.event.ondemand'])
    await page.evaluate((val) => { document.querySelector('.footer').innerHTML = val }, en['button.event.modal.footer'])
    await page.evaluate((val) => { document.querySelector('.confirm').innerHTML = val }, en['button.confirm'])
    await page.screenshot({ path: './screenshots/en/opsiweb_pushinstallations.png' })
    await page.evaluate((val) => { document.querySelector('.eventlabel').innerHTML = val }, de['button.event.ondemand'])
    await page.evaluate((val) => { document.querySelector('.modal-title').innerHTML = val }, de['button.event.ondemand'])
    await page.evaluate((val) => { document.querySelector('.footer').innerHTML = val }, de['button.event.modal.footer'])
    await page.evaluate((val) => { document.querySelector('.confirm').innerHTML = val }, de['button.confirm'])
    await page.screenshot({ path: './screenshots/de/opsiweb_pushinstallations.png' })
  })
  test('Selections', async ({ page }) => {
    await callStoryId(page, 'modal-m-selections-all', 'm-selections-all')
    await page.click('[data-testid="MSelectionsAll"] .btn')
    await page.setViewportSize({ width: 750, height: 400 })
    await page.evaluate((val) => { document.querySelector('.modal-title').innerHTML = val }, en['title.selectedElements'])
    await page.evaluate((val) => { document.querySelector('.depots').innerHTML = val }, en['title.depots'])
    await page.evaluate((val) => { document.querySelector('.clients').innerHTML = val }, en['title.clients'])
    await page.screenshot({ path: './screenshots/en/opsiweb_selections.png' })
    await page.evaluate((val) => { document.querySelector('.modal-title').innerHTML = val }, de['title.selectedElements'])
    await page.screenshot({ path: './screenshots/de/opsiweb_selections.png' })
  })
})
test.describe('OPSI specific Settings', () => {
  test('OPSI Modules', async ({ page }) => {
    await callStoryId(page, 'view-v-settings', 'v-settings')
    await page.click('.nav-tabs .nav-link:not(.active)')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    const component = await page.locator('[data-testid="VSettings"]')
    await page.evaluate((val) => { document.querySelector('.localspecific').innerHTML = val }, en['form.localspecific'])
    await page.evaluate((val) => { document.querySelector('.opsispecific').innerHTML = val }, en['form.modules'])
    await page.evaluate((val) => { document.querySelector('.modules').innerHTML = val }, en['form.modules.available'])
    await component.screenshot({ path: './screenshots/en/opsiweb_opsimodules.png' })
    await page.evaluate((val) => { document.querySelector('.localspecific').innerHTML = val }, de['form.localspecific'])
    await page.evaluate((val) => { document.querySelector('.opsispecific').innerHTML = val }, de['form.modules'])
    await page.evaluate((val) => { document.querySelector('.modules').innerHTML = val }, de['form.modules.available'])
    await component.screenshot({ path: './screenshots/de/opsiweb_opsimodules.png' })
  })
})
test.describe('GUI Settings', () => {
  test('Language', async ({ page }) => {
    await callStoryId(page, 'dropdown-dd-lang', 'dd-lang')
    const component = await page.locator('[data-testid="DropdownDDLang"]')
    await component.click()
    await page.setViewportSize({ width: 220, height: 150 })
    await page.screenshot({ path: './screenshots/en/opsiweb_language.png' })
    await page.screenshot({ path: './screenshots/de/opsiweb_language.png' })
  })
  //   test('Theme Main Layout in Dark Theme', async ({ page }) => {
  //     // TODO: Main layout in dark theme
  //     await page.screenshot({ path: './screenshots/en/opsiweb_mainlayout_dark.png' })
  //     await page.screenshot({ path: './screenshots/de/opsiweb_mainlayout_dark.png' })
  //   })
  test('Theme', async ({ page }) => {
    await callStoryId(page, 'dropdown-dd-theme', 'dd-theme')
    await page.click('[data-testid="DropdownDDTheme"] .btn')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await page.setViewportSize({ width: 220, height: 150 })
    await page.screenshot({ path: './screenshots/en/opsiweb_theme.png' })
    await page.screenshot({ path: './screenshots/de/opsiweb_theme.png' })
  })
})

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
