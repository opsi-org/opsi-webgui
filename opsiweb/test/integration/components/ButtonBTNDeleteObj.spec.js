const { test, expect } = require('@playwright/test')

test('button delete obj snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=button-btn-delete-obj--btn-delete-obj&args=')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btndeleteobj.png')
})
