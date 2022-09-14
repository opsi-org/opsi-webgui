const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')

test('Button Config', async ({ page }) => {
  await callStoryId(page, 'button-btn-row-link-to', 'btn-row-link-to-config')
  const component = await page.locator('[data-testid="ButtonBTNRowLinkTo"]')
  await component.screenshot({ path: './screenshots/en/opsiweb_buttonconfig.png' })
  await component.screenshot({ path: './screenshots/de/opsiweb_buttonconfig.png' })
})
