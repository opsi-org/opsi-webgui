const { test, expect } = require('@playwright/test')

test('button info snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=button-b-t-n-info--btn-info&args=&viewMode=story')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btninfo.png')
})
