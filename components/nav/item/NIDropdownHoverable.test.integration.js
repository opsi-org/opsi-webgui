const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../../.utils/playwright/pw-story-call')

test('navitem- dropdown hoverable snapshot', async ({ page }) => {
  await callStoryId(page, 'navitem-n-i-dropdown-hoverable', 'ni-dropdown-hoverable')
  const component = await page.locator('[data-testid="NIDropdownHoverable"]')
  expect(await component.screenshot()).toMatchSnapshot('NIDropdownHoverable.png', { maxDiffPixelRatio: 0.2 })
})
