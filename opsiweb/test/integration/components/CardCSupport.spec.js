const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('card support snapshot', async ({ page }) => {
  await callStoryId(page, 'card-c-support', 'c-support')
  const component = await page.locator('[data-testid="CardCSupport"]')
  expect(await component.screenshot()).toMatchSnapshot('card-csupport.png')
})
