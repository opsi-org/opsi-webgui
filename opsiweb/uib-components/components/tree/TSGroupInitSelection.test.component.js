const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('TSGroupInitSelection', async ({ page }) => {
  await callStoryId(page, 'tree-ts-group-init-selection', 'ts-group-init-selection')
  const component = page.locator('[data-testid="TSGroupInitSelection"]')
  expect(await component.screenshot()).toMatchSnapshot('TSGroupInitSelection.png')
})
