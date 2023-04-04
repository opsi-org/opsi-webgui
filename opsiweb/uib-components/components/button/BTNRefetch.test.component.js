const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('button refetch snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-refetch', 'btn-refetch')
  const component = await page.locator('[data-testid="BTNRefetch"]')
  expect(await component.screenshot()).toMatchSnapshot('BTNRefetch.png', { threshold: 0.2 })
})
