const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('button help tooltip snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-help-tooltip', 'btn-help-tooltip')
  // const component = await page.querySelector('[data-testid="BTNHelpTooltip"]')
  const component = await page.locator('[data-testid="BTNHelpTooltip"]')
  expect(await component.screenshot()).toMatchSnapshot('BTNHelpTooltip.png')
})

// test('button help tooltip hover snapshot', async ({ page, browserName }) => {
//   // TODO: hover does not work (im sure its a playwright problem.. )
//   test.fail(browserName === 'webkit' || browserName === 'firefox' || browserName === 'chromium', 'This feature currently has problems on Mac/Firefox/chromium')

//   await callStoryId(page, 'button-btn-help-tooltip', 'btn-help-tooltip')
//   await page.hover('[data-testid="BTNHelpTooltip"]')
//   expect(await page.screenshot()).toMatchSnapshot('BTNHelpTooltip-hover.png')
// })
