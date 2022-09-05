const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../../.utils/playwright/pw-story-call')

test('tableCell product property ID snapshot', async ({ page }) => {
  await callStoryId(page, 'tablecell-t-c-product-property-id', 'tc-product-property-id')
  const component = await page.locator('[data-testid="TCProductPropertyId"]')
  expect(await component.screenshot()).toMatchSnapshot('TCProductPropertyId.png')
})
