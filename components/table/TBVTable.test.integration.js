const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('bvtable snapshot', async ({ page }) => {
  await callStoryId(page, 'table-tbv-table', 'tbv-table')
  const component = await page.locator('[data-testid="TBVTable"]')
  expect(await component.screenshot()).toMatchSnapshot('TBVTable.png')
})
