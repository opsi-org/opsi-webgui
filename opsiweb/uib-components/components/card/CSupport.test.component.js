const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('snapshot > card support', async ({ page }) => {
  await callStoryId(page, 'card-c-support', 'c-support')
  const component = page.locator('[data-testid="CardCSupport"]')
  expect(await component.screenshot()).toMatchSnapshot('CSupport.png')
})
