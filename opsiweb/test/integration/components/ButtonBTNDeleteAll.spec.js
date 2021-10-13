const { test, expect } = require('@playwright/test')

test('button delete all snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=button-btn-delete-all--btn-delete-all&args=')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btndeleteall.png')
})
