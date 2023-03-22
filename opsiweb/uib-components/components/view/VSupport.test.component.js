const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-support snapshot', async ({ page }) => {
  await callStoryId(page, 'view-v-support', 'v-support')
  const component = await page.locator('[data-testid="VSupport"]')
  expect(await component.screenshot()).toMatchSnapshot('VSupport.png')
})
