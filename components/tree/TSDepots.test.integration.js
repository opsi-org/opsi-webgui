const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('treeselect-depots snapshot', async ({ page }) => {
  await callStoryId(page, 'tree-t-s-depots', 'ts-depots')
  const component = await page.locator('[data-testid="TSDepots"]')
  expect(await component.screenshot()).toMatchSnapshot('tree-tsdepots.png')
})
