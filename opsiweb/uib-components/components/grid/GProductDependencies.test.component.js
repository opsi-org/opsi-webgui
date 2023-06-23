const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('product dependencies', async ({ page }) => {
  await callStoryId(page, 'grid-g-product-dependencies', 'g-product-dependencies')
  const component = page.locator('[data-testid="GProductDependencies"]')
  expect(await component.screenshot()).toMatchSnapshot('GProductDependencies.png')
})
