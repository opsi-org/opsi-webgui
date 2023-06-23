const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('treeselect-productgroups', async ({ page }) => {
  await callStoryId(page, 'tree-ts-product-groups', 'ts-product-group')
  const component = page.locator('[data-testid="TSProductGroups"]')
  expect(await component.screenshot()).toMatchSnapshot('TSProductGroups-closed.png')
})

test('treeselect-productgroups openend', async ({ page }) => {
  await callStoryId(page, 'tree-ts-product-groups', 'ts-product-group')
  await page.click('[data-testid="TSProductGroups"]')
  expect(await page.screenshot()).toMatchSnapshot('TSProductGroups-open.png')
})
