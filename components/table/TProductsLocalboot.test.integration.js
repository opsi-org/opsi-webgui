const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('table-productslocalboot snapshot', async ({ page }) => {
  await callStoryId(page, 'table-t-productslocalboot', 't-products-localboot')
  const component = await page.locator('[data-testid="TProductsLocalboot"]')
  expect(await component.screenshot()).toMatchSnapshot('table-productslocalboot.png')
})
