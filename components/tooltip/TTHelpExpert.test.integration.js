const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('tooltip-helpexpert snapshot', async ({ page }) => {
  await callStoryId(page, 'tooltip-tt-help-expert', 'tt-help-expert')
  await page.hover('#target')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  // const component = await page.locator('[data-testid="TTHelpExpert"]')
  expect(await page.screenshot()).toMatchSnapshot('TTHelpExpert.png')
})
