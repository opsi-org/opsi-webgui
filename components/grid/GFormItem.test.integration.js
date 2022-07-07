const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('grid form item snapshot', async ({ page }) => {
  await callStoryId(page, 'grid-g-form-item', 'g-form-item')
  const component = await page.locator('[data-testid="GFormItem"]')
  expect(await component.screenshot()).toMatchSnapshot('GFormItem.png')
})
