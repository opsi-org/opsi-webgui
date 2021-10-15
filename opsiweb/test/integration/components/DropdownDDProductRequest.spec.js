const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('dropdown DDProductRequest head snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-product-request', 'dd-product-request-head')
  expect(await page.screenshot()).toMatchSnapshot('comp-dropdown-ddproductrequest-head.png')
})

test('dropdown DDProductRequest head opened snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-product-request', 'dd-product-request-head')
  await page.click('[data-testid="DropdownDDProductRequest"]')
  expect(await page.screenshot()).toMatchSnapshot('comp-dropdown-ddproductrequest-head-opened.png')
})

test('dropdown DDProductRequest cell snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-product-request', 'dd-product-request-cell')
  expect(await page.screenshot()).toMatchSnapshot('comp-dropdown-ddproductrequest-cell.png')
})

test('dropdown DDProductRequest cell opened snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-product-request', 'dd-product-request-cell')
  await page.click('[data-testid="DropdownDDProductRequest"]')
  expect(await page.screenshot()).toMatchSnapshot('comp-dropdown-ddproductrequest-cell-opened.png')
})
