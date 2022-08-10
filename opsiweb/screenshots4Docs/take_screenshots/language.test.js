const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')

test('Language', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-lang', 'dd-lang')
  const component = await page.locator('[data-testid="DropdownDDLang"]')
  await component.click()
  await page.setViewportSize({ width: 220, height: 150 })
  await page.screenshot({ path: './screenshots/en/opsiweb_language.png' })
  await page.screenshot({ path: './screenshots/de/opsiweb_language.png' })
})
