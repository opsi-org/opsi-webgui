const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-product-property snapshot', async ({ page }) => {
  await callStoryId(page, 'view-v-product-property', 'v-product-property')
  const component = await page.locator('[data-testid="VProductProperty"]')
  expect(await component.screenshot()).toMatchSnapshot('VProductProperty-properties.png')
})

test('view-product-property dependencies snapshot', async ({ page }) => {
  await callStoryId(page, 'view-v-product-property', 'v-product-property')
  await page.click('.nav-tabs .nav-link:not(.active)')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  const component = await page.locator('[data-testid="VProductProperty"]')
  expect(await component.screenshot()).toMatchSnapshot('VProductProperty-dependencies.png')
})
