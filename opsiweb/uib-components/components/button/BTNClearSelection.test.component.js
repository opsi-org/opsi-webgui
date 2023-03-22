const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('button clear all selections snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-clear-selection', 'btn-clear-selection')
  const component = await page.locator('[data-testid="BTNClearSelection"]')
  expect(await component.screenshot()).toMatchSnapshot('BTNClearSelection.png')
})
