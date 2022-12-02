const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('grid host parameter snapshot', async ({ page }) => {
  await callStoryId(page, 'grid-g-host-parameter', 'g-host-param')
  const component = await page.locator('[data-testid="GHostParam"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  expect(await component.screenshot()).toMatchSnapshot('GHostParam.png')
})
