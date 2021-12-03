const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('button delete obj snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-delete-obj', 'btn-delete-obj')
  const component = await page.locator('[data-testid="ButtonBTNDeleteObj"]')
  expect(await component.screenshot()).toMatchSnapshot('button-btndeleteobj.png')
})
