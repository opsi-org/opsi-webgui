const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('treeselect-depots-not-stored', async ({ page }) => {
  await callStoryId(page, 'tree-ts-depots-not-stored', 'ts-depots-not-stored')
  const component = page.locator('[data-testid="TSDepotsNotStored"]')
  expect(await component.screenshot()).toMatchSnapshot('TSDepotsNotStored.png')
})
