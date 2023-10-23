const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('tabs-t-server-health', async ({ page }) => {
  await callStoryId(page, 'tabs-t-server-health', 't-server-health')
  const component = page.locator('[data-testid="TServerHealth"]')
  expect(await component.screenshot()).toMatchSnapshot('TServerHealth.png')
})
