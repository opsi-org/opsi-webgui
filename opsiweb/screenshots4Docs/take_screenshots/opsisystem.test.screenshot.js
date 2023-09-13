const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/en.json')
const de = require('../../uib-components/locale/de.json')

test('opsi admin', async ({ page }) => {
  await callStoryId(page, 'view-v-admin', 'v-admin')
  // await page.click('.nav-tabs .nav-link:not(.active)')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  const component = await page.locator('[data-testid="VAdmin"]')
  await page.evaluate((val) => { document.querySelector('.titleclients').innerHTML = val }, en['title.clients'])
  await page.evaluate((val) => { document.querySelector('.titleproducts').innerHTML = val }, en['title.products'])
  await component.screenshot({ path: './screenshots/en/opsi-webgui_opsisystem_admin.png' })
  await page.evaluate((val) => { document.querySelector('.titleclients').innerHTML = val }, de['title.clients'])
  await page.evaluate((val) => { document.querySelector('.titleproducts').innerHTML = val }, de['title.products'])
  await component.screenshot({ path: './screenshots/de/opsi-webgui_opsisystem_admin.png' })
})

test('opsi terminal', async ({ page }) => {
  await callStoryId(page, 'view-v-admin-terminal', 'v-admin-terminal')
  // await page.click('.nav-tabs .nav-link:not(.active)')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  const component = await page.locator('[data-testid="VAdminTerminal"]')
  // wss://localhost:4447/messagebus/v1?
  const cursor = '<span class="xterm-cursor xterm-cursor-blink xterm-cursor-block"> </span>'

  const server = 'opsiconfd@062b112a9628:~$ '
  const id = 'bd0ebec1-6cd2-4a3a-a174-d1c5f432d77c'
  const channel = 'service_worker:ast14:1:terminal'
  await page.locator('#terminalId').fill(id)
  await page.locator('#terminalChannel').fill(channel)
  await page.evaluate((val) => { document.querySelector('.xterm-rows > div:first-child').innerHTML = val }, server + cursor)
  // language specifics
  await page.evaluate((val) => { document.querySelector('.lblTerminalId').innerHTML = val }, en['table.field.terminalId'])
  await page.evaluate((val) => { document.querySelector('.lblTerminalChannel').innerHTML = val }, en['table.field.terminalChannel'])

  await component.screenshot({ path: './screenshots/en/opsi-webgui_opsisystem_terminal.png' })
  await page.evaluate((val) => { document.querySelector('.lblTerminalId').innerHTML = val }, de['table.field.terminalId'])
  await page.evaluate((val) => { document.querySelector('.lblTerminalChannel').innerHTML = val }, de['table.field.terminalChannel'])
  await component.screenshot({ path: './screenshots/de/opsi-webgui_opsisystem_terminal.png' })
})

test('opsi healthcheck', async ({ page }) => {
  await callStoryId(page, 'view-v-server-health', 'v-server-health')
  // await page.click('.nav-tabs .nav-link:not(.active)')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  const component = await page.locator('[data-testid="VServerHealthCheck"]')

  await page.evaluate((val) => { document.querySelector('.nav-link.active').innerHTML = val }, en['title.healthcheck'])
  await page.evaluate((val) => { document.querySelector('.nav-link:not(.active)').innerHTML = val }, en['title.diagnostics'])
  await component.screenshot({ path: './screenshots/en/opsi-webgui_opsisystem_healthcheck.png' })
  await page.click('.nav-tabs .nav-link:not(.active)')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.screenshot({ path: './screenshots/en/opsi-webgui_opsisystem_diagnostics.png' })


  await page.click('.nav-tabs .nav-link:not(.active)')
  await page.evaluate((val) => { document.querySelector('.nav-link.active').innerHTML = val }, de['title.healthcheck'])
  await page.evaluate((val) => { document.querySelector('.nav-link:not(.active)').innerHTML = val }, de['title.diagnostics'])
  await component.screenshot({ path: './screenshots/de/opsi-webgui_opsisystem_healthcheck.png' })
  await page.click('.nav-tabs .nav-link:not(.active)')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.screenshot({ path: './screenshots/de/opsi-webgui_opsisystem_diagnostics.png' })

})

// test('opsi diagnostics', async ({ page }) => {
//   await callStoryId(page, 'view-v-server-health', 'v-server-health')
//   await page.click('.nav-tabs .nav-link:not(.active)')
//   await (new Promise(resolve => setTimeout(resolve, 1000)))
//   const component = await page.locator('[data-testid="VServerHealthCheck"]')

//   await component.evaluate((val) => { document.querySelector('.nav-link:not(.active)').innerHTML = val }, en['title.healthcheck'])
//   await component.evaluate((val) => { document.querySelector('.nav-link.active').innerHTML = val }, en['title.diagnostics'])

//   await (new Promise(resolve => setTimeout(resolve, 1000)))
//   await page.screenshot({ path: './screenshots/en/opsi-webgui_opsisystem_diagnostics.png' })
//   await component.evaluate((val) => { document.querySelector('.nav-link:not(.active)').innerHTML = val }, de['title.healthcheck'])
//   await component.evaluate((val) => { document.querySelector('.nav-link.active').innerHTML = val }, de['title.diagnostics'])
//   await page.screenshot({ path: './screenshots/de/opsi-webgui_opsisystem_diagnostics.png' })
// })

// test('opsi V Server Health', async ({ page }) => {
//   await callStoryId(page, 'view-v-server-health', 'v-server-health')
//   // await page.click('.nav-tabs .nav-link:not(.active)')
//   await (new Promise(resolve => setTimeout(resolve, 1000)))
//   // const component = await page.locator('[data-testid="VHealthCheck"]')
//   // await page.evaluate((val) => { document.querySelector('.lblTerminalChannel').innerHTML = val }, en['table.field.terminalChannel'])
//   await page.screenshot({ path: './screenshots/en/opsi-webgui_opsisystem_terminal.png' })
//   // await page.evaluate((val) => { document.querySelector('.lblTerminalChannel').innerHTML = val }, de['table.field.terminalChannel'])
//   await page.screenshot({ path: './screenshots/de/opsi-webgui_opsisystem_terminal.png' })
// })

test('OPSI Modules', async ({ page }) => {
  await callStoryId(page, 'view-v-modules', 'v-modules')
  // await page.click('.nav-tabs .nav-link:not(.active)')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  const component = await page.locator('[data-testid="VModules"]')
  // await page.evaluate((val) => { document.querySelector('.localspecific').innerHTML = val }, en['form.general'])
  // await page.evaluate((val) => { document.querySelector('.opsispecific').innerHTML = val }, en['form.opsi'])
  await page.evaluate((val) => { document.querySelector('.modules').innerHTML = val }, en['form.modules.available'])
  await component.screenshot({ path: './screenshots/en/opsi-webgui_opsimodules.png' })
  // await page.evaluate((val) => { document.querySelector('.localspecific').innerHTML = val }, de['form.general'])
  // await page.evaluate((val) => { document.querySelector('.opsispecific').innerHTML = val }, de['form.opsi'])
  await page.evaluate((val) => { document.querySelector('.modules').innerHTML = val }, de['form.modules.available'])
  await component.screenshot({ path: './screenshots/de/opsi-webgui_opsimodules.png' })
})
