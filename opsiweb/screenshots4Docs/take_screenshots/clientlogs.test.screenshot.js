const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/opsi-webgui_en.json')
const de = require('../../uib-components/locale/opsi-webgui_de.jsonjson')

test('Client Logs', async ({ page }) => {
  await callStoryId(page, 'view-v-clients-log', 'v-clients-log')
  // await page.setViewportSize({ width: 1000, height: 510 })
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.evaluate((val) => { document.querySelector('.filter_logs').placeholder = val }, en['form.filter.logs'])
  await page.screenshot({ path: './screenshots/en/opsi-webgui_clientlogs.png' })
  await page.evaluate((val) => { document.querySelector('.filter_logs').placeholder = val }, de['form.filter.logs'])
  await page.screenshot({ path: './screenshots/de/opsi-webgui_clientlogs.png' })
})
