const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('table header', async ({ page }) => {
  await callStoryId(page, 'bar-b-table-header', 'b-table-header')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  expect(await page.screenshot()).toMatchSnapshot('BTableHeader.png', { maxDiffPixelRatio: 0.1 })
})
