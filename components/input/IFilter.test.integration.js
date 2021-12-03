const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('input-filter snapshot', async ({ page }) => {
  await callStoryId(page, 'input-i-filter', 'i-filter')
  const component = await page.locator('[data-testid="IFilter"]')
  expect(await component.screenshot()).toMatchSnapshot('input-ifilter.png')
})
