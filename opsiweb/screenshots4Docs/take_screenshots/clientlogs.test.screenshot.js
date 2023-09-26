const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
<<<<<<< HEAD
const en = require('../../uib-components/locale/webgui_en.json')
const de = require('../../uib-components/locale/webgui_de.json')
=======
const en = require('../../uib-components/locale/en.json')
const de = require('../../uib-components/locale/de.json')
>>>>>>> main

test('Client Logs', async ({ page }) => {
  await callStoryId(page, 'view-v-clients-log', 'v-clients-log')
  // await page.setViewportSize({ width: 1000, height: 510 })
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.evaluate((val) => { document.querySelector('.filter_logs').placeholder = val }, en['form.filter.logs'])
  await page.screenshot({ path: './screenshots/en/opsi-webgui_clientlogs.png' })
  await page.evaluate((val) => { document.querySelector('.filter_logs').placeholder = val }, de['form.filter.logs'])
  await page.screenshot({ path: './screenshots/de/opsi-webgui_clientlogs.png' })
})
