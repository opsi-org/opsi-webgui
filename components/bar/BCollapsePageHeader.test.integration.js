const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('bar bbreadcrumb snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-collapse-page-header', 'b-collapse-page-header')
  const component = await page.locator('[data-testid="BarBCollapsePageHeader"]')
  expect(await component.screenshot()).toMatchSnapshot('BCollapsePageHeader.png')
})
