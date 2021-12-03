const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('icon-details snapshot', async ({ page }) => {
  await callStoryId(page, 'icon-i-details', 'i-details')
  const component = await page.locator('[data-testid="IDetails"]')
  expect(await component.screenshot()).toMatchSnapshot('icon-idetails.png')
})
