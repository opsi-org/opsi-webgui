const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-login snapshot', async ({ page }) => {
  await callStoryId(page, 'view-v-login', 'v-login')
  const component = await page.locator('[data-testid="VLogin"]')
  expect(await component.screenshot()).toMatchSnapshot('VLogin.png')
})
