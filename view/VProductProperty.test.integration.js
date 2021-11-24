const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('view product property snapshot', async ({ page }) => {
  await callStoryId(page, 'view-v-product-property', 'v-product-property')
  const component = await page.locator('[data-testid="VProductProperty"]')
  expect(await component.screenshot()).toMatchSnapshot('view-vproductproperty.png')
})
