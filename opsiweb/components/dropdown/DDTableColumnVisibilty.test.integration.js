const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('dropdown DDTableColumnVisibility snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-table-column-visibility', 'dd-table-column-visibility')
  const component = await page.locator('[data-testid="DropdownDDProductRequest"]')
  expect(await component.screenshot()).toMatchSnapshot('dropdown-ddtablecolumnvisibility.png')
})
