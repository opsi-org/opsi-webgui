const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('client deletion modal', async ({ page }) => {
  await callStoryId(page, 'modal-m-delete-client', 'm-delete-client')
  const component = page.locator('[data-testid="MDeleteClient"]')
  expect(await component.screenshot()).toMatchSnapshot('MDeleteClient.png')
})
