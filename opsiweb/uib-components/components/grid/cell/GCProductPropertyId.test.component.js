const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../../.utils/playwright/pw-story-call')

test('product property ID', async ({ page }) => {
  await callStoryId(page, 'gridcell-g-c-product-property-id', 'gc-product-property-id')
  const component = page.locator('[data-testid="GCProductPropertyId"]')
  expect(await component.screenshot()).toMatchSnapshot('GCProductPropertyId.png')
})
