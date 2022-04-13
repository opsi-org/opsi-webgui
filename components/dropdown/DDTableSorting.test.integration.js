const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('dropdown DDTableSorting snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-table-sorting', 'dd-table-sorting')
  const component = await page.locator('[data-testid="DropdownDDTableSorting"]')
  expect(await component.screenshot()).toMatchSnapshot('DDTableSorting-menu.png')
})

test('dropdown DDTableSorting content snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-table-sorting', 'dd-table-sorting')
  await page.click('[data-testid="DropdownDDTableSorting"] .btn')
  const component = await page.locator('[data-testid="DropdownDDTableSorting"] > ul')
  expect(await component.screenshot()).toMatchSnapshot('DDTableSorting-content.png')
})
