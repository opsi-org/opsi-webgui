const { test, expect } = require('@playwright/test')

test('bar btablepagination snapshot', async ({ page }) => {
  // await page.goto(getStoryFrame('id=alert-aalert--alert&args=&viewMode=story'))
  await page.goto('http://localhost:3003/iframe.html?id=bar-b-table-pagination--b-table-pagination&args=&viewMode=story')
  expect(await page.screenshot()).toMatchSnapshot('comp-bar-btablepagination.png')
})
test('bar btablepagination open snapshot', async ({ page }) => {
  // await page.goto(getStoryFrame('id=alert-aalert--alert&args=&viewMode=story'))
  await page.goto('http://localhost:3003/iframe.html?id=bar-b-table-pagination--b-table-pagination&args=&viewMode=story')
  await page.click('.BarBPagination-PerPage-Dropdown')
  expect(await page.screenshot()).toMatchSnapshot('comp-bar-btablepagination-open.png')
})
