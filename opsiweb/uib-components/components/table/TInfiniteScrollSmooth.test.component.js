const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('table with infinite scroll', async ({ page }) => {
  await callStoryId(page, 'table-t-infinite-scroll-smooth', 't-infinite-scroll-smooth')
  expect(await page.screenshot()).toMatchSnapshot('TInfiniteScrollSmooth.png', { maxDiffPixelRatio: 0.2 })
})
// todo fix stories and add tests for scrolling
