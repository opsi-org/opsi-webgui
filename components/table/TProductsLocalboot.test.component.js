const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

// test('table-productslocalboot snapshot single-select', async ({ page }) => {
//   await callStoryId(page, 'table-t-products-localboot', 't-products-localboot-single')
//   const component = await page.locator('[data-testid="TProductsLocalboot"]')
//   await page.locator(':nth-match([id^=tableproducts__row_], 1)').click()
//   await page.locator(':nth-match([id^=tableproducts__row_], 2)').click()
//   // only second row should be selected
//   expect(await component.screenshot()).toMatchSnapshot('TProductsLocalboot.png')
// })

test('table-productsnetboot like localboot snapshot', async ({ page }) => {
  await callStoryId(page, 'table-t-products-netboot', 't-products-netboot')
  const component = await page.locator('[data-testid="TProductsNetboot"]')
  await page.locator('tbody > tr[aria-rowindex="1"]').click()
  await page.locator('tbody > tr[aria-rowindex="2"]').click()
  expect(await component.screenshot()).toMatchSnapshot('TProductsLocalboot-table.png')
})

test('table-productslocalboot snapshot multi-select', async ({ page }) => {
  await callStoryId(page, 'table-t-products-localboot', 't-products-localboot')
  const component = await page.locator('[data-testid="TProductsLocalboot"]')
  await page.locator('tbody > tr[aria-rowindex="1"]').click()
  await page.locator('tbody > tr[aria-rowindex="2"]').click()
  // both rows should be selected
  expect(await component.screenshot()).toMatchSnapshot('TProductsLocalboot-table.png')
})
test('table-productslocalboot snapshot contextmenu', async ({ page }) => {
  await callStoryId(page, 'table-t-products-localboot', 't-products-localboot')
  const component = await page.locator('[data-testid="TProductsLocalboot"]')
  await page.locator('tbody > tr[aria-rowindex="1"]').click({ button: 'right' })
  // both rows should be selected
  expect(await component.screenshot()).toMatchSnapshot('TProductsLocalboot-contextmenu.png')
})
