const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('icon opsilogo snapshot', async ({ page }) => {
  await callStoryId(page, 'icon-i-opsi-logo', 'i-opsi-logo')
  const component = await page.locator('[data-testid="IconIOpsiLogo"]')
  expect(await component.screenshot()).toMatchSnapshot('icon-iopsilogo.png')
})