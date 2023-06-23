const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../../.utils/playwright/pw-story-call')

test('hoverable dropdown navitem', async ({ page }) => {
  await callStoryId(page, 'navitem-n-i-dropdown-hoverable', 'ni-dropdown-hoverable')
  const component = page.locator('[data-testid="NIDropdownHoverable-Servers"]')
  expect(await component.screenshot()).toMatchSnapshot('NIDropdownHoverable.png', { maxDiffPixelRatio: 0.2 })
})
