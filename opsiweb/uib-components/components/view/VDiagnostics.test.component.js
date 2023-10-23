const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-v-diagnostics', async ({ page }) => {
  await callStoryId(page, 'view-v-diagnostics', 'v-diagnostics')
  const component = page.locator('[data-testid="VDiagnostics"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  expect(await component.screenshot()).toMatchSnapshot('VDiagnostics.png')
})
