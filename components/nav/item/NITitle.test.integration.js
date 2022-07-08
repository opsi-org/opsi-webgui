const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../../.utils/playwright/pw-story-call')

test('navitem title snapshot', async ({ page }) => {
  await callStoryId(page, 'navitem-n-i-title', 'ni-title')
  const component = await page.locator('[data-testid="NITitle"]')
  expect(await component.screenshot()).toMatchSnapshot('NITitle.png')
})
