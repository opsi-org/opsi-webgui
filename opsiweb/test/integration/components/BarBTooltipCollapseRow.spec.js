const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('bar bpageheader snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-tooltip-collapse-row', 'b-tooltip-collapse-row')
  const component = await page.locator('[data-testid="BarBTooltipCollapseRow"]')
  // TODO: chromium and webkit looks different from firefox
  test.fail(browserName === 'webkit' || browserName === 'chromium', 'This feature currently has problems on webkit/chromium')
  expect(await component.screenshot()).toMatchSnapshot('bar-btooltipcollapserow.png')
})
