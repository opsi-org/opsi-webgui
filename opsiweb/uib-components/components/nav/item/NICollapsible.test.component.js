const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../../.utils/playwright/pw-story-call')

test('collapsible navitem', async ({ page }) => {
  await callStoryId(page, 'navitem-n-i-collapsible', 'ni-collapsible')
  const component = page.locator('[data-testid="NICollapsible"]')
  expect(await component.screenshot()).toMatchSnapshot('NICollapsible.png', { maxDiffPixelRatio: 0.2 })
})
