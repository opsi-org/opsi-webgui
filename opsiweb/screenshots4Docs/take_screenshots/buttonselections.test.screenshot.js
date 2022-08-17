const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
test('Button selections', async ({ page }) => {
  await callStoryId(page, 'button-btn-info', 'btn-info')
  const component = await page.locator('[data-testid="ButtonBTNInfo"]')
  await component.screenshot({ path: './screenshots/en/opsiweb_buttonselections.png' })
  await component.screenshot({ path: './screenshots/de/opsiweb_buttonselections.png' })
})
