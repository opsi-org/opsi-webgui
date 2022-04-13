const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('grid-two colum layout snapshot', async ({ page }) => {
  await callStoryId(page, 'grid-g-two-column-layout', 'g-two-column-layout')
  const component = await page.locator('[data-testid="GTwoColumnLayout"]')
  expect(await component.screenshot()).toMatchSnapshot('GTwoColumnLayout.png')
})
