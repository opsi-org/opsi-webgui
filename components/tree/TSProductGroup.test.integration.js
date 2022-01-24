const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('treeselect-productgroup snapshot', async ({ page }) => {
  await callStoryId(page, 'tree-t-s-productgroup', 'ts-product-group')
  const component = await page.locator('[data-testid="TSProductGroup"]')
  expect(await component.screenshot()).toMatchSnapshot('tree-tsproductgroup.png')
})
