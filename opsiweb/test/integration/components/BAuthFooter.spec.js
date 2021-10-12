const { test, expect } = require('@playwright/test')

test('alert default snapshot', async ({ page }) => {
  // await page.goto(getStoryFrame('id=alert-aalert--alert&args=&viewMode=story'))
  await page.goto('http://localhost:3003/iframe.html?id=bar-b-auth-footer--b-auth-footer&args=&viewMode=story')
  expect(await page.screenshot()).toMatchSnapshot('comp-bar-bauthfooter.png')
})
