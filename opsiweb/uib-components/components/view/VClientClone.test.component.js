const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-v-client-clone', async ({ page }) => {
  await callStoryId(page, 'view-v-client-clone', 'v-client-clone')
  const component = page.locator('[data-testid="VClientClone"]')
  expect(await component.screenshot()).toMatchSnapshot('VClientClone.png')
})
