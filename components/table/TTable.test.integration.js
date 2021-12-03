const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('table snapshot', async ({ page }) => {
  await callStoryId(page, 'table-t-table', 't-table')
  const component = await page.locator('[data-testid="TTable"]')
  expect(await component.screenshot()).toMatchSnapshot('table.png')
})
