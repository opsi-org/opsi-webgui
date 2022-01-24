const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('icon-expert snapshot', async ({ page }) => {
  await callStoryId(page, 'icon-i-expert', 'i-expert')
  const component = await page.locator('[data-testid="IExpert"]')
  expect(await component.screenshot()).toMatchSnapshot('icon-iexpert.png')
})
