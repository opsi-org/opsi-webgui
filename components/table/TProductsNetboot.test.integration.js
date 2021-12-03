const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('table-productsnetboot snapshot', async ({ page }) => {
  await callStoryId(page, 'table-t-productsnetboot', 't-products-netboot')
  const component = await page.locator('[data-testid="TProductsNetboot"]')
  expect(await component.screenshot()).toMatchSnapshot('table-productsnetboot.png')
})
