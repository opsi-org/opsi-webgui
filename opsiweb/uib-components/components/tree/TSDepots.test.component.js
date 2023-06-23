
const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('treeselect-Depots', async ({ page }) => {
  await callStoryId(page, 'tree-ts-depots', 'ts-depots')
  const component = page.locator('[data-testid="TSDepots"]')
  expect(await component.screenshot()).toMatchSnapshot('TSDepots-closed.png')
})

test('treeselect-Depots openend', async ({ page }) => {
  await callStoryId(page, 'tree-ts-depots', 'ts-depots')
  await page.click('[data-testid="TSDepots"]')
  expect(await page.screenshot()).toMatchSnapshot('TSDepots-open.png')
})
