const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../../.utils/playwright/pw-story-call')

test('tableCell product comparison', async ({ page }) => {
  await callStoryId(page, 'tablecell-t-c-badge-compares', 'tc-badge-compares')
  const component = page.locator('[data-testid="TCBadgeCompares"]')
  expect(await component.screenshot()).toMatchSnapshot('TCBadgeCompares.png')
})
