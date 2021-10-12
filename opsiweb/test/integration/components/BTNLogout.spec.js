const { test, expect } = require('@playwright/test')

test('button logout snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=button-btn-logout--btn-logout&args=&viewMode=story')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btnlogout.png')
})
