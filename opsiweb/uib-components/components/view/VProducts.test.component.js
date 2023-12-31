const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-products', async ({ page }) => {
  await callStoryId(page, 'view-v-products', 'v-products')
  const component = page.locator('[data-testid="VProducts"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  expect(await component.screenshot()).toMatchSnapshot('VProducts-main.png')
})
