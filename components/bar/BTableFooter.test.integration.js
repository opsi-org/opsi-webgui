const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('bar btablefooter snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-table-footer', 'b-table-footer')
  const component = await page.locator('[data-testid="BTableFooter"]')
  expect(await component.screenshot()).toMatchSnapshot('BTableFooter.png', { maxDiffPixelRatio: 0.2 })
})
