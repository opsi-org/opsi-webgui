const { test, expect } = require('@playwright/test')

test('bar bside snapshot', async ({ page }) => {
  // await page.goto(getStoryFrame('id=alert-aalert--alert&args=&viewMode=story'))
  await page.goto('http://localhost:3003/iframe.html?id=bar-b-side--b-side&args=&viewMode=story')
  expect(await page.screenshot()).toMatchSnapshot('comp-bar-bside.png')
})

test('bar bside expanded snapshot', async ({ page }) => {
  // await page.goto(getStoryFrame('id=alert-aalert--alert&args=&viewMode=story'))
  await page.goto('http://localhost:3003/iframe.html?id=bar-b-side--b-side-expanded&args=&viewMode=story')
  expect(await page.screenshot()).toMatchSnapshot('comp-bar-bside-expanded.png')
})
