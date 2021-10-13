const { test, expect } = require('@playwright/test')

test('bar bpageheader snapshot', async ({ page }) => {
  // await page.goto(getStoryFrame('id=alert-aalert--alert&args=&viewMode=story'))
  await page.goto('http://localhost:3003/iframe.html?id=bar-b-page-header--b-page-header&args=&viewMode=story')
  expect(await page.screenshot()).toMatchSnapshot('comp-bar-bpageheader.png')
})
