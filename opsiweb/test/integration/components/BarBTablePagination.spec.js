const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('bar btablepagination snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-table-pagination', 'b-table-pagination')
  expect(await page.screenshot()).toMatchSnapshot('comp-bar-btablepagination.png')
})
test('bar btablepagination open snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-table-pagination', 'b-table-pagination')
  await page.click('.BarBPagination-PerPage-Dropdown')
  expect(await page.screenshot()).toMatchSnapshot('comp-bar-btablepagination-open.png')
})
