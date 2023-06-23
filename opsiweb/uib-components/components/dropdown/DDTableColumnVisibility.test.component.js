const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('TableColumn dropdown', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-table-column-visibility', 'dd-table-column-visibility')
  const component = page.locator('[data-testid="DropdownDDTableColumnVisibility"]')
  expect(await component.screenshot()).toMatchSnapshot('DDTableColumnVisibility-menu.png')
})

test('TableColumn dropdown menu', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-table-column-visibility', 'dd-table-column-visibility')
  await page.click('[data-testid="DropdownDDTableColumnVisibility"] .btn')
  const component = page.locator('[data-testid="DropdownDDTableColumnVisibility"] > ul')
  expect(await component.screenshot()).toMatchSnapshot('DDTableColumnVisibility-content.png')
})
