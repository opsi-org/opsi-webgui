const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/en.json')
const de = require('../../uib-components/locale/de.json')
test('Servers treeselect', async ({ page }) => {
  await callStoryId(page, 'tree-ts-depots', 'ts-depots')
  await page.click('[data-testid="TSDepots"]')
  await page.evaluate((val) => { document.querySelector('.vue-treeselect__placeholder').innerHTML = val }, en['title.depots'])
  await page.evaluate((val) => { document.querySelector('.clearButton').innerHTML = val }, en['table.selection.clear'])
  await page.setViewportSize({ width: 320, height: 230 })
  await page.screenshot({ path: './screenshots/en/opsiweb_serverstreeselect.png' })
  await page.evaluate((val) => { document.querySelector('.clearButton').innerHTML = val }, de['table.selection.clear'])
  await page.screenshot({ path: './screenshots/de/opsiweb_serverstreeselect.png' })
})
