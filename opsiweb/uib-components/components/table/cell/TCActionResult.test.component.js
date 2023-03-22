const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../../.utils/playwright/pw-story-call')

test('tableCell actionResult snapshot', async ({ page }) => {
  await callStoryId(page, 'tablecell-t-c-action-result', 'tc-action-result')
  const component = await page.locator('[data-testid="TCActionResult"]')
  expect(await component.screenshot()).toMatchSnapshot('TCActionResult.png')
})
