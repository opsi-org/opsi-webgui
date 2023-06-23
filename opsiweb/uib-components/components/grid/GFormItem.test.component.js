const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('form item', async ({ page }) => {
  await callStoryId(page, 'grid-g-form-item', 'g-form-item')
  const component = page.locator('[data-testid="GFormItem"]')
  expect(await component.screenshot()).toMatchSnapshot('GFormItem.png')
})
