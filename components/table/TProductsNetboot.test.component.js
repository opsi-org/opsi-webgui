const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('table-productsnetboot snapshot', async ({ page }) => {
  await callStoryId(page, 'table-t-products-netboot', 't-products-netboot')
  const component = await page.locator('[data-testid="TProductsNetboot"]')
  await page.locator('tbody > tr[aria-rowindex="1"]').click()
  await page.locator('tbody > tr[aria-rowindex="2"]').click()
  expect(await component.screenshot()).toMatchSnapshot('TProductsNetboot.png')
})

test('table-productsnetboot like localboot snapshot', async ({ page }) => {
  await callStoryId(page, 'table-t-products-localboot', 't-products-localboot')
  const component = await page.locator('[data-testid="TProductsLocalboot"]')
  await page.locator('tbody > tr[aria-rowindex="1"]').click()
  await page.locator('tbody > tr[aria-rowindex="2"]').click()
  expect(await component.screenshot()).toMatchSnapshot('TProductsNetboot.png') // netboot should look like localboot
})
