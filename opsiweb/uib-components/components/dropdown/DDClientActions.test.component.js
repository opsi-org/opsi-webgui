const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('dropdown client actions snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-client-actions', 'dd-client-actions')
  // await page.click('[data-testid="DDClientActions"]')
  await page.click('[data-testid="DDClientActions"] .btn')
  await page.setViewportSize({ width: 250, height: 180 })
  expect(await page.screenshot()).toMatchSnapshot('DDClientActions.png', { maxDiffPixelRatio: 0.2 })
})
