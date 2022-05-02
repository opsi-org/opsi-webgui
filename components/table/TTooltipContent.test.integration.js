const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('table-tooltipcontent snapshot', async ({ page }) => {
  await callStoryId(page, 'table-t-tooltip-content', 't-tooltip-content')
  const component = await page.locator('[data-testid="TTooltipContent"]')
  expect(await component.screenshot()).toMatchSnapshot('TTooltipContent.png')
})
