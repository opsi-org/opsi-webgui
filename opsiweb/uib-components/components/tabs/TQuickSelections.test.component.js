const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('tabs-t-quick-selections', async ({ page }) => {
  await callStoryId(page, 'tabs-t-quick-selections', 't-quick-selections')
  const component = page.locator('[data-testid="TQuickSelections"]')
  expect(await component.screenshot()).toMatchSnapshot('TQuickSelections.png')
})
