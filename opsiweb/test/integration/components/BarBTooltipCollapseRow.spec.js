const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('bar btooltipcollapserow snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-tooltip-collapse-row', 'b-tooltip-collapse-row')
  const component = await page.locator('[data-testid="BarBTooltipCollapseRow"]')
  expect(await component.screenshot()).toMatchSnapshot('bar-btooltipcollapserow.png')
})