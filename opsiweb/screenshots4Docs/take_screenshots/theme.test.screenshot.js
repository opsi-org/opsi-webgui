const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')

test('Theme', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-theme', 'dd-theme')
  await page.click('[data-testid="DropdownDDTheme"] .btn')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.setViewportSize({ width: 220, height: 150 })
  await page.screenshot({ path: './screenshots/en/opsiweb_theme.png' })
  await page.screenshot({ path: './screenshots/de/opsiweb_theme.png' })
})
