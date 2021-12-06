const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('icon-loading snapshot', async ({ page }) => {
  await callStoryId(page, 'icon-i-loading', 'i-loading')
  const component = await page.locator('[data-testid="ILoading"]')
  expect(await component.screenshot()).toMatchSnapshot('icon-iloading.png')
})
