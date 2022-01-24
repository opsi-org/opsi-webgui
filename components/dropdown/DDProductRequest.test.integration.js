const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('dropdown DDProductRequest head snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-product-request', 'dd-product-request-head')
  const component = await page.locator('[data-testid="DropdownDDProductRequest"]')
  expect(await component.screenshot()).toMatchSnapshot('dropdown-ddproductrequest-head-normal.png')
})

test('dropdown DDProductRequest head opened snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-product-request', 'dd-product-request-head')
  await page.click('[data-testid="DropdownDDProductRequest"]')
  const content = await page.locator('[data-testid="DropdownDDProductRequest"] > ul')
  expect(await content.screenshot()).toMatchSnapshot('dropdown-ddproductrequest-head-openedcontent.png', { threshold: 0.2 })
  // expect(await page.screenshot()).toMatchSnapshot('dropdown-ddproductrequest-head-opened.png', { threshold: 0.2 })
})

test('dropdown DDProductRequest cell snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-product-request', 'dd-product-request-cell')
  const component = await page.locator('[data-testid="DropdownDDProductRequest"]')
  expect(await component.screenshot()).toMatchSnapshot('dropdown-ddproductrequest-cell-normal.png')
})

test('dropdown DDProductRequest cell opened snapshot', async ({ page }) => {
  // TODO: hover does not work (im sure its a playwright problem.. )
  // test.fail(browserName === 'webkit' || browserName === 'firefox' || browserName === 'chromium', 'This feature currently has problems on Mac/Firefox/chromium')
  await callStoryId(page, 'dropdown-dd-product-request', 'dd-product-request-cell')
  await page.click('[data-testid="DropdownDDProductRequest"]')
  const content = await page.locator('[data-testid="DropdownDDProductRequest"] > ul')
  expect(await content.screenshot()).toMatchSnapshot('dropdown-ddproductrequest-cell-openedcontent.png', { threshold: 0.2 })
})
