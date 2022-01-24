const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('collapse ccontent snapshot', async ({ page }) => {
  await callStoryId(page, 'collapse-c-content', 'c-content')
  const component = await page.locator('[data-testid="CollapseCContent"]')
  expect(await component.screenshot()).toMatchSnapshot('collapse-ccontent.png')
})
// test('bar btablepagination open snapshot', async ({ page }) => {
//   await callStoryId(page, 'collapse-btn-c-collapse', 'btn-c-collapse')
//   // await page.click('.BarBPagination-PerPage-Dropdown')
//   expect(await page.screenshot()).toMatchSnapshot('comp-bar-btablepagination-open.png')
// })
