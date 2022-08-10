const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/en.json')
const de = require('../../uib-components/locale/de.json')

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