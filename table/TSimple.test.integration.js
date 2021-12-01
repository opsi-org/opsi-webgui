const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('table-simple snapshot', async ({ page }) => {
  await callStoryId(page, 'table-t-simple', 't-simple')
  const component = await page.locator('[data-testid="TSimple"]')
  expect(await component.screenshot()).toMatchSnapshot('table-simple.png')
})
