const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
test('Button Info', async ({ page }) => {
  await callStoryId(page, 'button-btn-info', 'btn-info')
  const component = await page.locator('[data-testid="ButtonBTNInfo"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await component.screenshot({ path: './screenshots/en/opsi-webgui_buttoninfo.png' })
  await component.screenshot({ path: './screenshots/de/opsi-webgui_buttoninfo.png' })
})
