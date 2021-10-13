const { test, expect } = require('@playwright/test')

test('card support snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=card-c-support--c-support&args=&viewMode=story')
  expect(await page.screenshot()).toMatchSnapshot('comp-card-csupport.png')
})
