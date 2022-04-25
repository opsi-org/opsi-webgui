const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-clients-log snapshot', async ({ page }) => {
  await callStoryId(page, 'view-v-clients-log', 'v-clients-log')
  const component = await page.locator('[data-testid="VClientsLog"]')
  expect(await component.screenshot()).toMatchSnapshot('VClientsLog.png')
})
