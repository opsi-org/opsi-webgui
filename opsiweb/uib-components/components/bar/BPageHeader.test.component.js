const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test.describe('snapshot', () => {
  test('page header', async ({ page }) => {
    await callStoryId(page, 'bar-b-page-header', 'b-page-header')
    const component = page.locator('[data-testid="BarBPageHeader"]')
    expect(await component.screenshot()).toMatchSnapshot('BPageHeader.png')
  })
})
