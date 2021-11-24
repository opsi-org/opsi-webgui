const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('view settings localspecific snapshot', async ({ page }) => {
  await callStoryId(page, 'view-v-settings-local-specific', 'v-settings-local-specific')
  const component = await page.locator('[data-testid="VSettingsLocalSpecific"]')
  expect(await component.screenshot()).toMatchSnapshot('view-vsettingslocalspecific.png')
})
