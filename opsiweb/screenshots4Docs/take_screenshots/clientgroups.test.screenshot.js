const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/en.json')
const de = require('../../uib-components/locale/de.json')
test('ClientGroups', async ({ page }) => {
  await callStoryId(page, 'tree-ts-host-groups', 'ts-host-groups')
  await page.click('[data-testid="TSHostGroups"]')
  await page.setViewportSize({ width: 320, height: 210 })
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.evaluate((val) => { document.querySelector('.vue-treeselect__placeholder').innerHTML = val }, en['treeselect.clientGroups'])
  await page.evaluate((val) => { document.querySelector('.clearButton').innerHTML = val }, en['table.selection.clear'])
  await page.screenshot({ path: './screenshots/en/opsi-webgui_clientgroups.png' })
  await page.evaluate((val) => { document.querySelector('.vue-treeselect__placeholder').innerHTML = val }, de['treeselect.clientGroups'])
  await page.evaluate((val) => { document.querySelector('.clearButton').innerHTML = val }, de['table.selection.clear'])
  await page.screenshot({ path: './screenshots/de/opsi-webgui_clientgroups.png' })
})
