const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('button clear all changes snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-clear-changes', 'btn-clear-changes')
  const component = await page.locator('[data-testid="BTNClearChanges"]')
  expect(await component.screenshot()).toMatchSnapshot('BTNClearChanges.png')
})
