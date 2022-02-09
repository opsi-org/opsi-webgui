const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('modal-product-save-overview snapshot empty', async ({ page }) => {
  await callStoryId(page, 'modal-m-prod-save-overview', 'm-prod-save-overview-empty')
  const component = await page.locator('[data-testid="MProdSaveOverview"]')
  expect(await component.screenshot()).toMatchSnapshot('modal-prodsaveoverview-empty.png')
})

test('modal-product-save-overview snapshot', async ({ page }) => {
  await callStoryId(page, 'modal-m-prod-save-overview', 'm-prod-save-overview')
  const component = await page.locator('[data-testid="MProdSaveOverview"]')
  expect(await component.screenshot()).toMatchSnapshot('modal-prodsaveoverview.png')
})

test('modal-product-save-overview snapshot click', async ({ page }) => {
  await callStoryId(page, 'modal-m-prod-save-overview', 'm-prod-save-overview')
  // const component = await page.locator('')
  await page.click('[data-testid="ButtonBTNOpenModal"]')
  expect(await page.screenshot()).toMatchSnapshot('modal-prodsaveoverview-click.png')
})
