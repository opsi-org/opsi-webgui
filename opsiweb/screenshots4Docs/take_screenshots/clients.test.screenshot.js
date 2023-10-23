const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/opsiweb-ui_en.json')
const de = require('../../uib-components/locale/opsiweb-ui_de.json')

test('Clients', async ({ page }) => {
  await callStoryId(page, 'view-v-clients', 'v-clients')
  const component = page.locator('[data-testid="VClients"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.evaluate((val) => { document.querySelector('.tableheader_title').innerHTML = val }, en['title.clients'])
  // await page.evaluate((val) => { document.getElementById('treeselect-Depots').innerHTML = val }, en['title.depots'])
  await component.evaluate(() => { document.querySelector('.count').innerHTML = '0/5' })

  await page.evaluate((val) => { document.querySelector('[aria-colindex="2"] > small > b').innerHTML = val }, en['table.fields.id'])
  await page.evaluate((val) => { document.querySelector('[aria-colindex="7"] > small > b').innerHTML = val }, en['table.fields.rowactions'])
  await page.evaluate((val) => { document.querySelector('.filter').placeholder = val }, en['table.filter'].replace('{el}', en['table.fields.id']))

  // await page.evaluate((val) => { document.getElementById('treeselect-HostGroups').innerHTML = val }, en['treeselect.clientGroups'])
  await page.evaluate((val) => { document.querySelector('.tableheader_products').innerHTML = val }, en['title.products'])
  await page.screenshot({
    path: './screenshots/en/opsi-webgui_clients.png',
    clip: {
      x: 0,
      y: 0,
      width: 1400,
      height: 460
    }
  })

  await page.evaluate((val) => { document.querySelector('.tableheader_title').innerHTML = val }, de['title.clients'])
  await page.evaluate((val) => { document.querySelector('[aria-colindex="2"] > small > b').innerHTML = val }, de['table.fields.id'])
  await page.evaluate((val) => { document.querySelector('[aria-colindex="7"] > small > b').innerHTML = val }, de['table.fields.rowactions'])
  await page.evaluate((val) => { document.querySelector('.filter').placeholder = val }, de['table.filter'].replace('{el}', de['table.fields.id']))
  // await page.evaluate((val) => { document.getElementById('treeselect-HostGroups').innerHTML = val }, de['treeselect.clientGroups'])
  await page.evaluate((val) => { document.querySelector('.tableheader_products').innerHTML = val }, de['title.products'])
  await page.screenshot({
    path: './screenshots/de/opsi-webgui_clients.png',
    clip: {
      x: 0,
      y: 0,
      width: 1400,
      height: 460
    }
  })
})
