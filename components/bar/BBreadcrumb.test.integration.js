const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('bar bbreadcrumb snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-breadcrumb', 'b-breadcrumb')
  const component = await page.locator('[data-testid="BarBBreadcrumb"]')
  expect(await component.screenshot()).toMatchSnapshot('bar-bbreadcrumb.png')
})
