const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('table-hostattributes snapshot', async ({ page }) => {
  await callStoryId(page, 'table-t-hostattributes', 't-host-attributes')
  const component = await page.locator('[data-testid="THostAttributes"]')
  expect(await component.screenshot()).toMatchSnapshot('table-hostattributes.png')
})
