const { test, expect } = require('@playwright/test')

test('div dscrollresult snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=div-d-scroll-result--d-scroll-result&args=&viewMode=story')
  expect(await page.screenshot()).toMatchSnapshot('comp-div-dscrollresult.png')
})

// test('div dscrollresult scroll2bottom snapshot', async ({ page }) => {
//   await page.goto('http://localhost:3003/iframe.html?id=div-d-scroll-result--d-scroll-result&args=&viewMode=story')
//   await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
//   expect(await page.screenshot()).toMatchSnapshot('comp-div-dscrollresult-scrolled.png')
// })
