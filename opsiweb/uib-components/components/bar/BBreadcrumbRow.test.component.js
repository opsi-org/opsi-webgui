const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test.describe('snapshot', () => {
  test('breadcrumb', async ({ page }) => {
    await callStoryId(page, 'bar-b-breadcrumb', 'b-breadcrumb')
    const component = page.locator('[data-testid="BarBBreadcrumb"]')
    expect(await component.screenshot()).toMatchSnapshot('BBreadcrumbRow.png')
  })
})
