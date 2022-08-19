const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/en.json')

test('Servers', async ({ page }) => {
  await callStoryId(page, 'view-v-depots', 'v-depots')
  const component = await page.locator('[data-testid="VDepots"]')
  await page.evaluate((val) => { document.querySelector('.nav-title').innerHTML = val }, en['title.depots'])
  await component.evaluate(() => { document.querySelector('.count').innerHTML = '1/7' })
  await component.evaluate(() => { document.querySelector('.filter').placeholder = 'Filter ID' })
  await component.screenshot({ path: './screenshots/en/opsiweb_servers.png' })
  await component.screenshot({ path: './screenshots/de/opsiweb_servers.png' })
})