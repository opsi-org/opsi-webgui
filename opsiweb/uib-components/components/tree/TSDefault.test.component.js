const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('treeselect-default snapshot', async ({ page }) => {
  await callStoryId(page, 'tree-ts-default', 'ts-default')
  // const component = await page.locator('[data-testid="TSDefault"]')
  expect(await page.screenshot()).toMatchSnapshot('TSDefault.png', { maxDiffPixelRatio: 0.2 })
})
