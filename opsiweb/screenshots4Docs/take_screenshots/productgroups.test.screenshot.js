const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/opsi-webgui_en.json')
const de = require('../../uib-components/locale/opsi-webgui_de.jsonjsonjsonjson')

test('Product Groups', async ({ page }) => {
  await callStoryId(page, 'tree-ts-product-groups', 'ts-product-group')
  await page.click('[data-testid="TSProductGroups"]')
  await page.setViewportSize({ width: 400, height: 180 })
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.evaluate((val) => { document.querySelector('.vue-treeselect__placeholder').innerHTML = val }, en['treeselect.prodGroups'])
  await page.evaluate((val) => { document.querySelector('.clearButton').innerHTML = val }, en['table.selection.clear'])
  await page.screenshot({ path: './screenshots/en/opsi-webgui_productgroups.png' })
  await page.evaluate((val) => { document.querySelector('.vue-treeselect__placeholder').innerHTML = val }, de['treeselect.prodGroups'])
  await page.evaluate((val) => { document.querySelector('.clearButton').innerHTML = val }, de['table.selection.clear'])
  await page.screenshot({ path: './screenshots/de/opsi-webgui_productgroups.png' })
})
