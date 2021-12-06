const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('tooltip-productcell snapshot', async ({ page }) => {
  await callStoryId(page, 'tooltip-t-t-productcell', 'tt-product-cell')
  const component = await page.locator('[data-testid="TTProductCell"]')
  expect(await component.screenshot()).toMatchSnapshot('tooltip-productcell.png')
})
