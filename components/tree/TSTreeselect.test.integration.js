const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('treeselect-clients-not-stored snapshot', async ({ page }) => {
  await callStoryId(page, 'tree-t-s-treeselect', 'ts-treeselect')
  const component = await page.locator('[data-testid="TSTreeselect"]')
  expect(await component.screenshot()).toMatchSnapshot('tree-tstreeselect.png')
})
