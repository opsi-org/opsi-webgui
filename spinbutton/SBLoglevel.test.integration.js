const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('spinbutton-loglevel snapshot', async ({ page }) => {
  await callStoryId(page, 'spinbutton-sb-loglevel', 'sb-loglevel')
  const component = await page.locator('[data-testid="SBLoglevel"]')
  expect(await component.screenshot()).toMatchSnapshot('spinbutton-loglevel.png')
})
