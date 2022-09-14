const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')

test('Button Client Log', async ({ page }) => {
  await callStoryId(page, 'button-btn-row-link-to', 'btn-row-link-to-log')
  const component = await page.locator('[data-testid="ButtonBTNRowLinkTo"]')
  await component.screenshot({ path: './screenshots/en/opsiweb_buttonclientlog.png' })
  await component.screenshot({ path: './screenshots/de/opsiweb_buttonclientlog.png' })
})
