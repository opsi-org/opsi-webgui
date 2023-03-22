const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('form-hostattributes snapshot', async ({ page }) => {
  await callStoryId(page, 'form-f-host-attributes', 'f-host-attributes')
  const component = await page.locator('[data-testid="FHostAttributes"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  expect(await component.screenshot()).toMatchSnapshot('FHostAttributes.png')
})
