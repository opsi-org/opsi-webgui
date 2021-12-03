const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('table-productproperties snapshot', async ({ page }) => {
  await callStoryId(page, 'table-t-productproperties', 't-product-properties')
  const component = await page.locator('[data-testid="TProductProperties"]')
  expect(await component.screenshot()).toMatchSnapshot('table-productproperties.png')
})
