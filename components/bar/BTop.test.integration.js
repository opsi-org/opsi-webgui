const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('bar btop snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-top', 'b-top')
  const component = await page.locator('[data-testid="BarBTop"]')
  expect(await component.screenshot()).toMatchSnapshot('bar-btop.png')
})
