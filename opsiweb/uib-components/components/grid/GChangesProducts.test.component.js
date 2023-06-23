const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('product changes', async ({ page }) => {
  await callStoryId(page, 'grid-g-changes-products', 'g-changes-products')
  const component = page.locator('[data-testid="GChangesProducts"]')
  expect(await component.screenshot()).toMatchSnapshot('GChangesProducts-close.png')
})

test('product changes with a product openend', async ({ page }) => {
  await callStoryId(page, 'grid-g-changes-products', 'g-changes-products')
  await page.click('button[aria-controls="product1"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  const component = page.locator('[data-testid="GChangesProducts"]')
  expect(await component.screenshot()).toMatchSnapshot('GChangesProducts-open.png')
})
