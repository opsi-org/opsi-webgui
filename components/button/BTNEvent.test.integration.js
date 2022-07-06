const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('button event snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-event', 'btn-event')
  const component = await page.locator('[data-testid="BTNEvent"]')
  expect(await component.screenshot()).toMatchSnapshot('BTNEvent.png')
})
