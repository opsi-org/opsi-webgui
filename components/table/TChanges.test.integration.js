const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('table-changes snapshot', async ({ page }) => {
  await callStoryId(page, 'table-t-changes', 't-changes')
  const component = await page.locator('[data-testid="TChanges"]')
  expect(await component.screenshot()).toMatchSnapshot('table-changes.png')
})
