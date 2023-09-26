const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/opsiweb-ui_en.jsonjson')
const de = require('../../uib-components/locale/opsiweb-ui_de.json')

test('Products', async ({ page }) => {
  await callStoryId(page, 'view-v-products', 'v-products')
  // const component = page.locator('[data-testid="VProducts"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.evaluate((val) => { document.querySelector('.tableheader_title').innerHTML = val }, en['title.products'])

  await page.evaluate((val) => { document.querySelector('[aria-colindex="2"] > small > b').innerHTML = val }, en['table.fields.id'])
  await page.evaluate((val) => { document.querySelector('[aria-colindex="3"] > small > b').innerHTML = val }, en['table.fields.rowactions'])

  await page.evaluate(() => { document.querySelector('.count').innerHTML = '0/3' })
  await page.evaluate((val) => { document.querySelector('.localboot').innerHTML = val }, en['title.localboot'] + ' (3)')
  await page.evaluate((val) => { document.querySelector('.netboot').innerHTML = val }, en['title.netboot'] + ' (7)')
  await page.evaluate((val) => { document.querySelector('.filter').placeholder = val }, en['table.filter'].replace('{el}', en['table.fields.id']))
  await page.screenshot({
    path: './screenshots/en/opsi-webgui_products.png',
    clip: {
      x: 5,
      y: 5,
      width: 1200,
      height: 430
    }
  })
  await page.evaluate((val) => { document.querySelector('.tableheader_title').innerHTML = val }, de['title.products'])

  await page.evaluate(() => { document.querySelector('.count').innerHTML = '0/3' })
  await page.evaluate((val) => { document.querySelector('.localboot').innerHTML = val }, de['title.localboot'] + ' (3)')
  await page.evaluate((val) => { document.querySelector('.netboot').innerHTML = val }, de['title.netboot'] + ' (7)')
  await page.evaluate((val) => { document.querySelector('.filter').placeholder = val }, de['table.filter'].replace('{el}', de['table.fields.id']))
  // await page.evaluate((val) => { document.getElementById('treeselect-HostGroups').innerHTML = val }, de['treeselect.clientGroups'])
  // await page.evaluate((val) => { document.getElementById('treeselect-ProductGroups').innerHTML = val }, de['treeselect.prodGroups'])
  await page.screenshot({
    path: './screenshots/de/opsi-webgui_products.png',
    clip: {
      x: 5,
      y: 5,
      width: 1200,
      height: 430
    }
  })
})
