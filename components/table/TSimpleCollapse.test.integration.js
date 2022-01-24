const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('table-simplecollapse snapshot', async ({ page }) => {
  await callStoryId(page, 'table-t-simple-collapse', 't-simple-collapse')
  const component = await page.locator('[data-testid="TSimpleCollapse"]')
  expect(await component.screenshot()).toMatchSnapshot('table-simplecollapse.png')
})
