const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('form-login snapshot', async ({ page }) => {
  await callStoryId(page, 'form-f-login', 'f-login')
  const component = await page.locator('[data-testid="FLogin"]')
  expect(await component.screenshot()).toMatchSnapshot('form-flogin.png')
})
