const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('treeselect-default', async ({ page }) => {
  await callStoryId(page, 'tree-ts-default', 'ts-default')
  expect(await page.screenshot()).toMatchSnapshot('TSDefault.png', { maxDiffPixelRatio: 0.2 })
})
