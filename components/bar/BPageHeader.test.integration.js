const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('bar bpageheader snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-page-header', 'b-page-header')
  const component = await page.locator('[data-testid="BarBPageHeader"]')
  expect(await component.screenshot()).toMatchSnapshot('BPageHeader.png')
})
