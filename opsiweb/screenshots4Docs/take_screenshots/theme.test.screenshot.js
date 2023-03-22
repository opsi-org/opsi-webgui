const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')

test('Theme', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-theme', 'dd-theme')
  await page.click('[data-testid="DropdownDDTheme"] .btn')
  await page.setViewportSize({ width: 280, height: 160 })
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.screenshot({ path: './screenshots/en/opsi-webgui_theme.png' })
  await page.screenshot({ path: './screenshots/de/opsi-webgui_theme.png' })
})
