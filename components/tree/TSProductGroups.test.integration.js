const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('treeselect-productgroups snapshot', async ({ page }) => {
  await callStoryId(page, 'tree-ts-product-groups', 'ts-product-group')
  const component = await page.locator('[data-testid="TSProductGroups"]')
  expect(await component.screenshot()).toMatchSnapshot('tree-tsproductgroups.png')
})

test('treeselect-productgroups snapshot open', async ({ page }) => {
  await callStoryId(page, 'tree-ts-product-groups', 'ts-product-group')
  await page.click('[data-testid="TSProductGroups"]')
  // const component = await page.locator('[data-testid="TSProductGroups"]')
  expect(await page.screenshot()).toMatchSnapshot('tree-tsproductgroups-open.png')
})
