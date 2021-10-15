const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('collapse ccontent snapshot', async ({ page }) => {
  await callStoryId(page, 'collapse-btn-c-collapse', 'btn-c-collapse')
  expect(await page.screenshot()).toMatchSnapshot('comp-collapse-ccontent.png')
})
// test('bar btablepagination open snapshot', async ({ page }) => {
//   await callStoryId(page, 'collapse-btn-c-collapse', 'btn-c-collapse')
//   // await page.click('.BarBPagination-PerPage-Dropdown')
//   expect(await page.screenshot()).toMatchSnapshot('comp-bar-btablepagination-open.png')
// })
