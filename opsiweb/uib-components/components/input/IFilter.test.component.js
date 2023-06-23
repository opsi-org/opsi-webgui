const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('filter input', async ({ page }) => {
  await callStoryId(page, 'input-i-filter', 'i-filter')
  const component = page.locator('[data-testid="IFilter"]')
  expect(await component.screenshot()).toMatchSnapshot('IFilter.png')
})
