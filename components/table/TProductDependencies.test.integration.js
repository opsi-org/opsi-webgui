const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('table-productdependencies snapshot', async ({ page }) => {
  await callStoryId(page, 'table-t-product-dependencies', 't-product-dependencies')
  const component = await page.locator('[data-testid="TProductDependencies"]')
  expect(await component.screenshot()).toMatchSnapshot('table-product-dependencies.png')
})
