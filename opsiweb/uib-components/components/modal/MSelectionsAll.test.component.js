const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('all selections', async ({ page }) => {
  await callStoryId(page, 'modal-m-selections-all', 'm-selections-all')
  const component = page.locator('[data-testid="MSelectionsAll"]')
  expect(await component.screenshot()).toMatchSnapshot('MSelectionsAll.png')
})
