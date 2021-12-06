const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('modal-product-save-overview snapshot', async ({ page }) => {
  await callStoryId(page, 'modal-m-prodsaveoverview', 'm-prod-save-overview')
  const component = await page.locator('[data-testid="MProdSaveOverview"]')
  expect(await component.screenshot()).toMatchSnapshot('modal-prodsaveoverview.png')
})
