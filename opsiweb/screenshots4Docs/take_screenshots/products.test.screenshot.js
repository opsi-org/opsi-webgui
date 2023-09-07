const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/webgui_en.json')
const de = require('../../uib-components/locale/webgui_de.json')

test('Products', async ({ page }) => {
  await callStoryId(page, 'view-v-products', 'v-products')
  const component = page.locator('[data-testid="VProducts"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.evaluate((val) => { document.querySelector('.tableheader_title').innerHTML = val }, en['title.products'])
  // await page.evaluate((val) => { document.getElementById('treeselect-Depots').innerHTML = val }, en['title.depots'])
  // await page.evaluate((val) => { document.getElementById('treeselect-HostGroups').innerHTML = val }, en['treeselect.clientGroups'])
  // await page.evaluate((val) => { document.getElementById('treeselect-ProductGroups').innerHTML = val }, en['treeselect.prodGroups'])
  await component.evaluate(() => { document.querySelector('.count').innerHTML = '0/3' })
  await component.evaluate(() => { document.querySelector('.localboot').innerHTML = 'Localboot(3)' })
  await component.evaluate(() => { document.querySelector('.netboot').innerHTML = 'Netboot(7)' })
  await component.evaluate(() => { document.querySelector('.filter').placeholder = 'Filter ID' })
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
