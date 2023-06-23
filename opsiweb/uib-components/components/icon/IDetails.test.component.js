const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('icon-details', async ({ page }) => {
  await callStoryId(page, 'icon-i-details', 'i-details')
  const component = page.locator('[data-testid="IDetails-All"]')
  expect(await component.screenshot()).toMatchSnapshot('IDetails.png')
})
