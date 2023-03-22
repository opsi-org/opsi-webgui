const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-client-creation snapshot', async ({ page }) => {
  await callStoryId(page, 'view-v-client-creation', 'v-client-creation')
  const component = await page.locator('[data-testid="VClientCreation"]')
  expect(await component.screenshot()).toMatchSnapshot('VClientCreation.png')
})
