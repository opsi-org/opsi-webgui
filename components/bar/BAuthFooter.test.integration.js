const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')
// test('bar bauthfooter snapshot', async ({ page }) => {
//   await callStoryId(page, 'bar-b-auth-footer', 'b-auth-footer')
//   const component = await page.locator('[data-testid="BarBAuthFooter"]')
//   expect(await component.screenshot()).toMatchSnapshot('bar-bauthfooter.png')
// })

test('bar bauthfooter snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-auth-footer', 'b-auth-footer')
  const component = await page.locator('[data-testid="BarBAuthFooter"]')
  await component.evaluate(() => { document.querySelector('.BAuthFooter-version').innerHTML = 'x.x.x' })
  expect(await page.screenshot()).toMatchSnapshot('BAuthFooter.png', { threshold: 0.2 })
})
