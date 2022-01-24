const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-products snapshot', async ({ page }) => {
  await callStoryId(page, 'view-v-products', 'v-products')
  const component = await page.locator('[data-testid="VProducts"]')
  expect(await component.screenshot()).toMatchSnapshot('view-vproducts.png')
})
