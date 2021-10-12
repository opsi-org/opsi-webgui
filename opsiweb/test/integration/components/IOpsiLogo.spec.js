const { test, expect } = require('@playwright/test')

test('icon opsilogo snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=logo--opsilogo&viewMode=story')
  expect(await page.screenshot()).toMatchSnapshot('comp-icon-iopsilogo.png')
})
