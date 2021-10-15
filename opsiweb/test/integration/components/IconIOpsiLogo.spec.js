const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('icon opsilogo snapshot', async ({ page }) => {
  await callStoryId(page, 'icon-i-opsi-logo', 'i-opsi-logo')
  // await page.goto('http://localhost:3003/iframe.html?id=dropdown-dd-product-request--dd-product-request-head&args=&viewMode=story')
  // await page.goto('http://localhost:3003/iframe.html?id=icon-i-opsi-logo--i-opsi-logo-head&args=&viewMode=story')
  expect(await page.screenshot()).toMatchSnapshot('comp-icon-iopsilogo.png')
})
