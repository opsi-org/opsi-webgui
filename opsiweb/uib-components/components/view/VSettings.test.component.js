const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-settings snapshot', async ({ page }) => {
  await callStoryId(page, 'view-v-settings', 'v-settings')
  const component = await page.locator('[data-testid="VSettings"]')
  expect(await component.screenshot()).toMatchSnapshot('VSettings.png')
})
