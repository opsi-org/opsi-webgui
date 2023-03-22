const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('grid-changes products snapshot', async ({ page }) => {
  await callStoryId(page, 'grid-g-changes-products', 'g-changes-products')
  const component = await page.locator('[data-testid="GChangesProducts"]')
  expect(await component.screenshot()).toMatchSnapshot('GChangesProducts-close.png')
})

test('grid-changes products open product snapshot', async ({ page }) => {
  await callStoryId(page, 'grid-g-changes-products', 'g-changes-products')
  await page.click('button[aria-controls="product1"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  const component = await page.locator('[data-testid="GChangesProducts"]')
  expect(await component.screenshot()).toMatchSnapshot('GChangesProducts-open.png')
})
