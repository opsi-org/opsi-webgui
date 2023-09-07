const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/webgui_en.json')

test('Servers', async ({ page }) => {
  await callStoryId(page, 'view-v-depots', 'v-depots')
  const component = page.locator('[data-testid="VDepots"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.evaluate((val) => { document.querySelector('.tableheader_title').innerHTML = val }, en['title.depots'])
  await component.evaluate(() => { document.querySelector('.count').innerHTML = '1/7' })
  await component.evaluate(() => { document.querySelector('.filter').placeholder = 'Filter ID' })
  await component.screenshot({ path: './screenshots/en/opsi-webgui_servers.png' })
  await component.screenshot({ path: './screenshots/de/opsi-webgui_servers.png' })
})
