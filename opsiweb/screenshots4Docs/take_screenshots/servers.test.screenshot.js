const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/opsi-webgui_en.json')
let de
try {
  de = require('../../uib-components/locale/opsi-webgui_de.json')
} catch (e) {
  console.error('Translations exist only in pipeline (Will be downloaded from Transifex)')
  de = {}
}
test('Servers', async ({ page }) => {
  await callStoryId(page, 'view-v-depots', 'v-depots')
  const component = page.locator('[data-testid="VDepots"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.evaluate(() => { document.querySelector('.count').innerHTML = '1/7' })
  await page.evaluate((val) => { document.querySelector('.tableheader_title').innerHTML = val }, en['title.depots'])
  await page.evaluate((val) => { document.querySelector('[aria-colindex="2"] > small > b').innerHTML = val }, en['table.fields.id'])
  await page.evaluate((val) => { document.querySelector('[aria-colindex="3"] > small > b').innerHTML = val }, en['table.fields.type'])
  await page.evaluate((val) => { document.querySelector('[aria-colindex="4"] > small > b').innerHTML = val }, en['table.fields.rowactions'])
  await page.evaluate((val) => { document.querySelector('.filter').placeholder = val }, en['table.filter'].replace('{el}', en['table.fields.id']))
  await component.screenshot({ path: './screenshots/en/opsi-webgui_servers.png' })

  await page.evaluate((val) => { document.querySelector('.tableheader_title').innerHTML = val }, de['title.depots'])
  await page.evaluate((val) => { document.querySelector('[aria-colindex="2"] > small > b').innerHTML = val }, de['table.fields.id'])
  await page.evaluate((val) => { document.querySelector('[aria-colindex="3"] > small > b').innerHTML = val }, de['table.fields.type'])
  await page.evaluate((val) => { document.querySelector('[aria-colindex="4"] > small > b').innerHTML = val }, de['table.fields.rowactions'])
  await page.evaluate((val) => { document.querySelector('.filter').placeholder = val }, de['table.filter'].replace('{el}', de['table.fields.id']))
  await component.screenshot({ path: './screenshots/de/opsi-webgui_servers.png' })
})
