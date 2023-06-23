const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('table-productsnetboot', async ({ page }) => {
  await callStoryId(page, 'table-t-products-netboot', 't-products-netboot')
  const component = page.locator('[data-testid="TProductsNetboot"]')
  await page.locator('tbody > tr[aria-rowindex="1"]').click()
  await page.locator('tbody > tr[aria-rowindex="2"]').click()
  expect(await component.screenshot()).toMatchSnapshot('TProductsLocalboot-table.png')
})

test('table-productslocalboot multi-select', async ({ page }) => {
  await callStoryId(page, 'table-t-products-localboot', 't-products-localboot')
  const component = page.locator('[data-testid="TProductsLocalboot"]')
  await page.locator('tbody > tr[aria-rowindex="1"]').click()
  await page.locator('tbody > tr[aria-rowindex="2"]').click()
  expect(await component.screenshot()).toMatchSnapshot('TProductsLocalboot-table.png')
})

test('table-productslocalboot contextmenu', async ({ page }) => {
  await callStoryId(page, 'table-t-products-localboot', 't-products-localboot')
  const component = page.locator('[data-testid="TProductsLocalboot"]')
  await page.locator('tbody > tr[aria-rowindex="1"]').click({ button: 'right' })
  page.locator('#right-click-menu')
  expect(await component.screenshot()).toMatchSnapshot('TProductsLocalboot-contextmenu.png')
})

test('table-productsnetboot contextmenu', async ({ page }) => {
  await callStoryId(page, 'table-t-products-netboot', 't-products-netboot')
  const component = page.locator('[data-testid="TProductsNetboot"]')
  await page.locator('tbody > tr[aria-rowindex="1"]').click({ button: 'right' })
  page.locator('#right-click-menu')
  expect(await component.screenshot()).toMatchSnapshot('TProductsLocalboot-contextmenu.png')
})
