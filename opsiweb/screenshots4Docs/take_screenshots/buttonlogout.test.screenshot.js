const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')

test('Button Logout', async ({ page }) => {
  await callStoryId(page, 'button-btn-logout', 'btn-logout')
  const component = await page.locator('[data-testid="ButtonBTNLogout"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await component.screenshot({ path: './screenshots/en/opsi-webgui_buttonlogout.png' })
  await component.screenshot({ path: './screenshots/de/opsi-webgui_buttonlogout.png' })
})
