const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('table-productslocalboot snapshot single-select', async ({ page }) => {
  await callStoryId(page, 'table-t-products-localboot', 't-products-localboot-single')
  const component = await page.locator('[data-testid="TProductsLocalboot"]')
  await page.locator(':nth-match([id^=tableproducts__row_], 1)').click()
  await page.locator(':nth-match([id^=tableproducts__row_], 2)').click()
  // only second row should be selected
  expect(await component.screenshot()).toMatchSnapshot('table-productslocalboot-single.png')
})

test('table-productslocalboot snapshot multi-select', async ({ page }) => {
  await callStoryId(page, 'table-t-products-localboot', 't-products-localboot-multi')
  const component = await page.locator('[data-testid="TProductsLocalboot"]')
  await page.locator(':nth-match([id^=tableproducts__row_], 1)').click()
  await page.locator(':nth-match([id^=tableproducts__row_], 2)').click()
  // both rows should be selected
  expect(await component.screenshot()).toMatchSnapshot('table-productslocalboot-multi.png')
})
