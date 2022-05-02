const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('table infinite scroll snapshot', async ({ page }) => {
  await callStoryId(page, 'table-t-infinite-scroll', 't-infinite-scroll')
  // const component = await page.locator('[data-testid="TInfiniteScroll"]')
  expect(await page.screenshot()).toMatchSnapshot('TInfiniteScroll.png')
})
// todo fix stories and add tests for scrolling
