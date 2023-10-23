const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')

test('Button Clear Selection', async ({ page }) => {
  await callStoryId(page, 'button-btn-clear-selection', 'btn-clear-selection')
  const component = page.locator('[data-testid="BTNClearSelection"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await component.screenshot({ path: './screenshots/en/opsi-webgui_buttonclearselect.png' })
  await component.screenshot({ path: './screenshots/de/opsi-webgui_buttonclearselect.png' })
})
