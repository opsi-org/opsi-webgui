const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('bar btablepagination snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-table-pagination', 'b-table-pagination')
  const component = await page.locator('[data-testid="BarBTablePagination"]')
  expect(await component.screenshot()).toMatchSnapshot('bar-btablepagination.png')
})

test('bar btablepagination open snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-table-pagination', 'b-table-pagination')
  await page.click('[data-testid="BarBTablePagination-Pagination"]')
  // TODO: firefox + webkit reacts different (do not show dropdown content)
  test.fail(browserName === 'webkit' || browserName === 'firefox', 'This feature currently has problems on Mac/Firefox')
  expect(await page.screenshot()).toMatchSnapshot('bar-btablepagination-open.png')
})
