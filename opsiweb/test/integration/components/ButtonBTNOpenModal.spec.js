const { test, expect } = require('@playwright/test')

test('button open modal snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=button-btn-open-modal--btn-open-modal&args=icon:b-icon-unknown')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btnopenmodal.png')
})
