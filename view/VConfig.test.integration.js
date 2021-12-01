const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('view-config snapshot', async ({ page }) => {
  await callStoryId(page, 'view-v-config', 'v-config')
  const component = await page.locator('[data-testid="VConfig"]')
  expect(await component.screenshot()).toMatchSnapshot('view-vconfig.png')
})
