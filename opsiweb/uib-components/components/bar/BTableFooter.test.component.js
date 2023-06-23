const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test.describe('snapshot', () => {
  test('table footer', async ({ page }) => {
    await callStoryId(page, 'bar-b-table-footer', 'b-table-footer')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    expect(await page.screenshot()).toMatchSnapshot('BTableFooter.png', { maxDiffPixelRatio: 0.1 })
  })
})
