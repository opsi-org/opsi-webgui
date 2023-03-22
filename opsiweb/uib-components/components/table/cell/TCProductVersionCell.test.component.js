const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../../.utils/playwright/pw-story-call')

test('tableCell product version snapshot', async ({ page }) => {
  await callStoryId(page, 'tablecell-t-c-product-version-cell', 'tc-product-version-cell')
  const component = await page.locator('[data-testid="TCProductVersionCell"]')
  expect(await component.screenshot()).toMatchSnapshot('TCProductVersionCell.png')
})
