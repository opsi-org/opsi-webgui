const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../../.utils/playwright/pw-story-call')

test('tableCell badge compares snapshot', async ({ page }) => {
  await callStoryId(page, 'tablecell-t-c-badge-compares', 'tc-badge-compares')
  const component = await page.locator('[data-testid="TCBadgeCompares"]')
  expect(await component.screenshot()).toMatchSnapshot('TCBadgeCompares.png')
})
