const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('host parameter', async ({ page }) => {
  await callStoryId(page, 'grid-g-host-param', 'g-host-param')
  const component = page.locator('[data-testid="GHostParam"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  expect(await component.screenshot()).toMatchSnapshot('GHostParam.png')
})
