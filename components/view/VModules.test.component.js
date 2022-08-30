const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-modules snapshot', async ({ page }) => {
  await callStoryId(page, 'view-v-modules', 'v-modules')
  const component = await page.locator('[data-testid="VModules"]')
  expect(await component.screenshot()).toMatchSnapshot('VModules.png')
})
