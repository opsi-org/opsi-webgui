const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('nav-sidebar snapshot', async ({ page }) => {
  await callStoryId(page, 'nav-n-sidebar', 'n-sidebar')
  const component = await page.locator('[data-testid="NSidebar"]')
  expect(await component.screenshot()).toMatchSnapshot('nav-sidebar.png')
})
