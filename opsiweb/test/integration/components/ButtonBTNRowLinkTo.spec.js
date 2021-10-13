const { test, expect } = require('@playwright/test')

test('button rowlinkto snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=button-btn-row-link-to--btn-row-link-to&args=&viewMode=story')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btnrowlinkto.png')
})
