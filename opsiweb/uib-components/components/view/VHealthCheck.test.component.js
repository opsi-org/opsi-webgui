const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-healthcheck', async ({ page }) => {
  await callStoryId(page, 'view-v-healthcheck', 'v-healthcheck')
  const component = page.locator('[data-testid="VHealthCheck"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  expect(await component.screenshot()).toMatchSnapshot('VHealthCheck.png')
})
