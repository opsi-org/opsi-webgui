const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('quickpanel', async ({ page }) => {
  await callStoryId(page, 'bar-b-quick-panel', 'b-quick-panel')
  const component = page.locator('[data-testid="BarBQuickPanel"]')
  expect(await component.screenshot()).toMatchSnapshot('BarBQuickPanel.png')
})
