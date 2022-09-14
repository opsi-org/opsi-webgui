const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')

test('Button Client Actions', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-client-actions', 'dd-client-actions')
  const component = await page.locator('[data-testid="DDClientActions"]')
  await component.screenshot({ path: './screenshots/en/opsiweb_buttonclientactions.png' })
  await component.screenshot({ path: './screenshots/de/opsiweb_buttonclientactions.png' })
})
