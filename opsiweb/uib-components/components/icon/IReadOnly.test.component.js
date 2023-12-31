const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('icon readonly', async ({ page }) => {
  await callStoryId(page, 'icon-i-read-only', 'i-read-only')
  const component = page.locator('[data-testid="IReadOnly"]')
  expect(await component.screenshot()).toMatchSnapshot('IReadOnly.png')
})
