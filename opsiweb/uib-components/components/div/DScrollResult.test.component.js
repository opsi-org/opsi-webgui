const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('snapshot > scrollable div', async ({ page }) => {
  await callStoryId(page, 'div-d-scroll-result', 'd-scroll-result')
  const component = page.locator('[data-testid="DivDScrollResult"]')
  expect(await component.screenshot()).toMatchSnapshot('DScrollResult.png')
})

// // TODO: Test scrolling..
// test('div dscrollresult scroll2bottom snapshot', async ({ page }) => {
//   await callStoryId(page, 'div-d-scroll-result', 'd-scroll-result')
//   const component = await page.locator('[data-testid="DivDScrollResult"]')
//   // await component.scrollTo(0, component.scrollHeight)
//   await page.evaluate(() => component.scrollTo(0, component.scrollHeight))
//   expect(await component.screenshot()).toMatchSnapshot('DScrollResult-scrolled.png')
// })
