const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-modules', async ({ page }) => {
  await callStoryId(page, 'view-v-modules', 'v-modules')
  const component = page.locator('[data-testid="VModules"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  expect(await component.screenshot()).toMatchSnapshot('VModules.png')
})
