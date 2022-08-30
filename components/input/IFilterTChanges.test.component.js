const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('input-filter-tchanges snapshot', async ({ page }) => {
  await callStoryId(page, 'input-i-filter-t-changes', 'i-filter-t-changes')
  const component = await page.locator('[data-testid="IFilterTChanges"]')
  expect(await component.screenshot()).toMatchSnapshot('IFilterTChanges.png')
})
