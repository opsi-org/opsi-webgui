const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('button reset snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-reset', 'btn-reset')
  const component = await page.locator('[data-testid="ButtonBTNReset"]')
  expect(await component.screenshot()).toMatchSnapshot('BTNReset.png', { threshold: 0.1 })
})
