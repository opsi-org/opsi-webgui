const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('tooltip-helpexpert snapshot', async ({ page }) => {
  await callStoryId(page, 'tooltip-t-t-helpexpert', 'tt-help-expert')
  const component = await page.locator('[data-testid="TTHelpExpert"]')
  expect(await component.screenshot()).toMatchSnapshot('tooltip-helpexpert.png')
})
