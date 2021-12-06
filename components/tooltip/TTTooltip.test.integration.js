const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('tooltip snapshot', async ({ page }) => {
  await callStoryId(page, 'tooltip-t-t-tooltip', 'tt-tooltip')
  const component = await page.locator('[data-testid="TTTooltip"]')
  expect(await component.screenshot()).toMatchSnapshot('tooltip.png')
})
