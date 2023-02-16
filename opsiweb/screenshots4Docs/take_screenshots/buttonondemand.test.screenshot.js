const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
test('Button on_demand', async ({ page }) => {
  await callStoryId(page, 'button-btn-event', 'btn-event-on-demand-default')
  const component = await page.locator('[data-testid="BTNEvent"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await component.screenshot({ path: './screenshots/en/opsiweb_buttonondemand.png' })
  await component.screenshot({ path: './screenshots/de/opsiweb_buttonondemand.png' })
})
