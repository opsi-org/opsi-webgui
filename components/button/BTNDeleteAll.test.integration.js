const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('button delete all snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-delete-all', 'btn-delete-all')
  const component = await page.locator('[data-testid="ButtonBTNDeleteAll"]')
  expect(await component.screenshot()).toMatchSnapshot('button-btndeleteall.png')
})
