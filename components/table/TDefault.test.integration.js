const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('default table snapshot', async ({ page }) => {
  await callStoryId(page, 'table-t-default', 't-default')
  const component = await page.locator('[data-testid="TDefault"]')
  expect(await component.screenshot()).toMatchSnapshot('tdefault.png')
})
