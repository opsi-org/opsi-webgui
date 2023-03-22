const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('button logout snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-logout', 'btn-logout')
  const component = await page.locator('[data-testid="ButtonBTNLogout"]')
  expect(await component.screenshot()).toMatchSnapshot('BTNLogout.png')
})
