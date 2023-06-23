const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('productproperties', async ({ page }) => {
  await callStoryId(page, 'grid-g-product-properties', 'g-product-properties')
  const component = page.locator('[data-testid="GProductProperties"]')
  expect(await component.screenshot()).toMatchSnapshot('GProductProperties.png', { maxDiffPixelRatio: 0.2 })
})
