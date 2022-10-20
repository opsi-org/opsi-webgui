const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../../.utils/playwright/pw-story-call')

test('grid cell product property ID snapshot', async ({ page }) => {
  await callStoryId(page, 'gridcell-g-c-product-property-id', 'gc-product-property-id')
  const component = await page.locator('[data-testid="GCProductPropertyId"]')
  expect(await component.screenshot()).toMatchSnapshot('GCProductPropertyId.png')
})
