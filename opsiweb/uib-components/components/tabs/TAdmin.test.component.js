const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('tabs-t-admin', async ({ page }) => {
  await callStoryId(page, 'tabs-t-admin', 't-admin')
  const component = page.locator('[data-testid="VAdmin"]')
  expect(await component.screenshot()).toMatchSnapshot('VAdmin.png')
})
