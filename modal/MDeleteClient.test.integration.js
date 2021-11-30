const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('modal-delete-client snapshot', async ({ page }) => {
  await callStoryId(page, 'modal-m-deleteclient', 'm-delete-client')
  const component = await page.locator('[data-testid="MDeleteClient"]')
  expect(await component.screenshot()).toMatchSnapshot('modal-deleteclient.png')
})
