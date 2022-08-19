const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/en.json')
const de = require('../../uib-components/locale/de.json')

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