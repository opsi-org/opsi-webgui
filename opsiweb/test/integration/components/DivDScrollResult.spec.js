const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('div dscrollresult snapshot', async ({ page }) => {
  await callStoryId(page, 'div-d-scroll-result', 'd-scroll-result')
  const component = await page.locator('[data-testid="DivDScrollResult"]')
  expect(await component.screenshot()).toMatchSnapshot('div-dscrollresult.png')
})

// TODO: Test scrolling..
// test('div dscrollresult scroll2bottom snapshot', async ({ page }) => {
//   await page.goto('http://localhost:3003/iframe.html?id=div-d-scroll-result--d-scroll-result&args=&viewMode=story')
//   await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
//   expect(await page.screenshot()).toMatchSnapshot('comp-div-dscrollresult-scrolled.png')
// })