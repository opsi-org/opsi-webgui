const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-admin snapshot', async ({ page }) => {
  await callStoryId(page, 'view-v-admin', 'v-admin')
  const component = await page.locator('[data-testid="VAdmin"]')
  expect(await component.screenshot()).toMatchSnapshot('VAdmin.png')
})
