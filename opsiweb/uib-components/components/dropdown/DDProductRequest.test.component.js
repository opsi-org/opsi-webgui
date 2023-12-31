const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('ProductRequest button content', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-product-request', 'dd-product-request-head')
  const component = page.locator('[data-testid="DropdownDDProductRequest"]')
  expect(await component.screenshot()).toMatchSnapshot('DDProductRequest-head-normal.png')
})

test('ProductRequest button content when clicked', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-product-request', 'dd-product-request-head')
  await page.click('[data-testid="DropdownDDProductRequest"]')
  const content = page.locator('[data-testid="DropdownDDProductRequest"] > ul')
  expect(await content.screenshot()).toMatchSnapshot('DDProductRequest-head-openedcontent.png', { threshold: 0.2 })
})

test('ProductRequest dropdown menu', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-product-request', 'dd-product-request-cell')
  const component = page.locator('[data-testid="DropdownDDProductRequest"]')
  expect(await component.screenshot()).toMatchSnapshot('DDProductRequest-cell-normal.png')
})

test('ProductRequest dropdown menu opened', async ({ page }) => {
  // TODO: hover does not work (im sure its a playwright problem.. )
  // test.fail(browserName === 'webkit' || browserName === 'firefox' || browserName === 'chromium', 'This feature currently has problems on Mac/Firefox/chromium')
  await callStoryId(page, 'dropdown-dd-product-request', 'dd-product-request-cell')
  await page.click('[data-testid="DropdownDDProductRequest"]')
  const content = page.locator('[data-testid="DropdownDDProductRequest"] > ul')
  expect(await content.screenshot()).toMatchSnapshot('DDProductRequest-cell-openedcontent.png', { threshold: 0.2 })
})
