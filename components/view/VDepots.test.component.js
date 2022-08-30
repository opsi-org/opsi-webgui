const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-depots snapshot', async ({ page }) => {
  await callStoryId(page, 'view-v-depots', 'v-depots')
  const component = await page.locator('[data-testid="VDepots"]')
  expect(await component.screenshot()).toMatchSnapshot('VDepots.png')
})
