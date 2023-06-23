const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-config', async ({ page }) => {
  await callStoryId(page, 'view-v-config', 'v-config-clients')
  const component = page.locator('[data-testid="VConfig"]')
  expect(await component.screenshot()).toMatchSnapshot('VConfig-clients.png')
})
