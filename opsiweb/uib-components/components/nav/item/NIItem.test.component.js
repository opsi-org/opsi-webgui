const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../../.utils/playwright/pw-story-call')

test('navitem snapshot', async ({ page }) => {
  await callStoryId(page, 'navitem-n-i-item', 'ni-item')
  const component = await page.locator('[data-testid="NIItem"]')
  expect(await component.screenshot()).toMatchSnapshot('NIItem.png', { maxDiffPixelRatio: 0.2 })
})
