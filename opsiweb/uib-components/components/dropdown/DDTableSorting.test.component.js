const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('TableSorting dropdown', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-table-sorting', 'dd-table-sorting')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  expect(await page.screenshot()).toMatchSnapshot('DDTableSorting-menu.png')
})

test('TableSorting dropdown menu', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-table-sorting', 'dd-table-sorting')
  await page.click('[data-testid="DropdownDDTableSorting"] .btn')
  const component = page.locator('[data-testid="DropdownDDTableSorting"] > ul')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  expect(await component.screenshot()).toMatchSnapshot('DDTableSorting-content.png')
})
