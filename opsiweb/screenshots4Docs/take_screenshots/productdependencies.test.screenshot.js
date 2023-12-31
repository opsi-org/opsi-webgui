const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/opsi-webgui_en.jsonjsonjson')
const de = require('../../uib-components/locale/opsi-webgui_de.jsonjsonjson')

test('Product Dependencies', async ({ page }) => {
  await callStoryId(page, 'view-v-product-property', 'v-product-property')
  await page.click('.nav-tabs .nav-link:not(.active)')
  await page.setViewportSize({ width: 900, height: 90 })
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  const component = page.locator('[data-testid="VProductProperty"]')
  await page.evaluate((val) => { document.querySelector('.tableheader_title').innerHTML = val }, en['title.config'])
  await page.evaluate((val) => { document.querySelector('.property').innerHTML = val }, en['title.properties'])
  await page.evaluate((val) => { document.querySelector('.dependency').innerHTML = val }, en['title.dependencies'])
  await page.evaluate((val) => { document.querySelector('[data-testid="GFormItem"]>.morevalcol').innerHTML = val }, en['table.fields.pre-required'])
  await component.screenshot({ path: './screenshots/en/opsi-webgui_productdependency.png' })
  await page.evaluate((val) => { document.querySelector('.tableheader_title').innerHTML = val }, de['title.config'])
  await page.evaluate((val) => { document.querySelector('.property').innerHTML = val }, de['title.properties'])
  await page.evaluate((val) => { document.querySelector('.dependency').innerHTML = val }, de['title.dependencies'])
  await page.evaluate((val) => { document.querySelector('[data-testid="GFormItem"]>.morevalcol').innerHTML = val }, de['table.fields.pre-required'])
  await component.screenshot({ path: './screenshots/de/opsi-webgui_productdependency.png' })
})
