const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('loglevel spinbutton', async ({ page }) => {
  await callStoryId(page, 'spinbutton-sb-loglevel', 'sb-loglevel')
  const component = page.locator('[data-testid="SBLoglevel"]')
  expect(await component.screenshot()).toMatchSnapshot('SBLoglevel.png')
})
