const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-clients-log', async ({ page }) => {
  await callStoryId(page, 'view-v-clients-log', 'v-clients-log')
  const component = page.locator('[data-testid="VClientsLog"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  expect(await component.screenshot()).toMatchSnapshot('VClientsLog.png')
})
