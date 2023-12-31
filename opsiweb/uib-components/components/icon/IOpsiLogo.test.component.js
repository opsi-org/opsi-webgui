const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('opsi logo', async ({ page }) => {
  await callStoryId(page, 'icon-i-opsi-logo', 'i-opsi-logo')
  const component = page.locator('[data-testid="IconIOpsiLogo-all"]')
  expect(await component.screenshot()).toMatchSnapshot('IOpsiLogo.png')
})
