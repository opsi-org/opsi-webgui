const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('button-btn-client-reachable', async ({ page }) => {
  await callStoryId(page, 'button-btn-client-reachable', 'btn-client-reachable')
  const component = page.locator('[data-testid="BTNClientReachable"]')
  expect(await component.screenshot()).toMatchSnapshot('BTNClientReachable.png')
})
