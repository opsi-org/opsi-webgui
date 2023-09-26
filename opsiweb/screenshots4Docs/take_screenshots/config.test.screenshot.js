const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/opsiweb-ui_en.json')
const de = require('../../uib-components/locale/opsiweb-ui_de.jsonjsonjsonjsonjson')

test('Client Configuration', async ({ page }) => {
  await callStoryId(page, 'view-v-config', 'v-config-clients')
  const component = page.locator('[data-testid="VConfig"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.evaluate((val) => { document.querySelector('.hostattr').innerHTML = val }, en['title.hostattr'])
  await page.evaluate((val) => { document.querySelector('.hostparam').innerHTML = val }, en['title.hostparam'])
  await page.evaluate((val) => { document.querySelector('.hostId').innerHTML = val }, en['table.fields.id'])
  await page.evaluate((val) => { document.querySelector('.type').innerHTML = val }, en['table.fields.type'])
  await page.evaluate((val) => { document.querySelector('.description').innerHTML = val }, en['table.fields.description'])
  await page.evaluate((val) => { document.querySelector('.notes').innerHTML = val }, en['table.fields.notes'])
  await page.evaluate((val) => { document.querySelector('.hardwareAddress').innerHTML = val }, en['table.fields.hwAddr'])
  await page.evaluate((val) => { document.querySelector('.ipAddress').innerHTML = val }, en['table.fields.ip'])
  await page.evaluate((val) => { document.querySelector('.inventoryNumber').innerHTML = val }, en['table.fields.inventNum'])
  await page.evaluate((val) => { document.querySelector('.created').innerHTML = val }, en['table.fields.created'])
  await page.evaluate((val) => { document.querySelector('.lastSeen').innerHTML = val }, en['table.fields.lastSeen'])
  await page.evaluate((val) => { document.querySelector('.opsiHostKey').innerHTML = val }, en['table.fields.hostKey'])
  await page.evaluate((val) => { document.querySelector('.oneTimePassword').innerHTML = val }, en['table.fields.otp'])
  await page.evaluate((val) => { document.querySelector('span.resetButton').innerHTML = val }, en['button.reset'])
  await page.evaluate((val) => { document.querySelector('span.updateButton').innerHTML = val }, en['button.save'])
  await component.screenshot({ path: './screenshots/en/opsi-webgui_clientconfig.png' })

  await page.evaluate((val) => { document.querySelector('.hostattr').innerHTML = val }, de['title.hostattr'])
  await page.evaluate((val) => { document.querySelector('.hostparam').innerHTML = val }, de['title.hostparam'])
  await page.evaluate((val) => { document.querySelector('.type').innerHTML = val }, de['table.fields.type'])
  await page.evaluate((val) => { document.querySelector('.description').innerHTML = val }, de['table.fields.description'])
  await page.evaluate((val) => { document.querySelector('.notes').innerHTML = val }, de['table.fields.notes'])
  await page.evaluate((val) => { document.querySelector('.inventoryNumber').innerHTML = val }, de['table.fields.inventNum'])
  await page.evaluate((val) => { document.querySelector('.created').innerHTML = val }, de['table.fields.created'])
  await page.evaluate((val) => { document.querySelector('.lastSeen').innerHTML = val }, de['table.fields.lastSeen'])
  await page.evaluate((val) => { document.querySelector('.opsiHostKey').innerHTML = val }, de['table.fields.hostKey'])
  await page.evaluate((val) => { document.querySelector('.oneTimePassword').innerHTML = val }, de['table.fields.otp'])
  await page.evaluate((val) => { document.querySelector('span.resetButton').innerHTML = val }, de['button.reset'])
  await page.evaluate((val) => { document.querySelector('span.updateButton').innerHTML = val }, de['button.save'])
  await component.screenshot({ path: './screenshots/de/opsi-webgui_clientconfig.png' })
})
