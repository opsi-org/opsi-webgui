const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/opsi-webgui_en.json')
const de = require('../../uib-components/locale/opsi-webgui_de.json')

test('Product Properties', async ({ page }) => {
  await callStoryId(page, 'view-v-product-property', 'v-product-property')
  const component = page.locator('[data-testid="VProductProperty"]')
  await page.setViewportSize({ width: 900, height: 320 })
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.evaluate((val) => { document.querySelector('.tableheader_title').innerHTML = val }, en['title.config'])
  await page.evaluate((val) => { document.querySelector('.property').innerHTML = val }, en['title.properties'])
  await page.evaluate((val) => { document.querySelector('.dependency').innerHTML = val }, en['title.dependencies'])
  await page.evaluate((val) => { document.querySelector('.noClientsSelectedShowDepot').innerHTML = val }, en['message.warning.noClientsSelectedShowDepot'])
  await page.evaluate((val) => { document.querySelector('.notOnEachDepot').innerHTML = val.replace('{count}', '1').replace('{countall}', '2') }, en['message.warning.notOnEachDepot'])
  await component.screenshot({ path: './screenshots/en/opsi-webgui_productprop.png' })
  await page.evaluate((val) => { document.querySelector('.tableheader_title').innerHTML = val }, de['title.config'])
  await page.evaluate((val) => { document.querySelector('.property').innerHTML = val }, de['title.properties'])
  await page.evaluate((val) => { document.querySelector('.dependency').innerHTML = val }, de['title.dependencies'])
  await page.evaluate((val) => { document.querySelector('.noClientsSelectedShowDepot').innerHTML = val }, de['message.warning.noClientsSelectedShowDepot'])
  await page.evaluate((val) => { document.querySelector('.notOnEachDepot').innerHTML = val.replace('{count}', '1').replace('{countall}', '2') }, de['message.warning.notOnEachDepot'])
  await component.screenshot({ path: './screenshots/de/opsi-webgui_productprop.png' })
})
