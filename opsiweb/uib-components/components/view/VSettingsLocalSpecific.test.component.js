const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-settings-localspecific', async ({ page }) => {
  await callStoryId(page, 'view-v-settings-local-specific', 'v-settings-local-specific')
  const component = page.locator('[data-testid="VSettingsLocalSpecific"]')
  expect(await component.screenshot()).toMatchSnapshot('VSettingsLocalSpecific.png')
})
