const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('host attributes', async ({ page }) => {
  await callStoryId(page, 'grid-g-host-attributes', 'g-host-attributes')
  const component = page.locator('[data-testid="GHostAttributes"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  expect(await component.screenshot()).toMatchSnapshot('GHostAttributes.png')
})
