const { test, expect } = require('@playwright/test')

test('button help snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=button-btn-help--btn-help&args=&viewMode=story')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btnhelp.png')
})
