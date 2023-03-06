const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')

test('Language', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-lang', 'dd-lang')
  const component = await page.locator('[data-testid="DropdownDDLang"]')
  await component.click()
  await page.setViewportSize({ width: 320, height: 160 })
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.screenshot({ path: './screenshots/en/opsi-webgui_language.png' })
  await page.screenshot({ path: './screenshots/de/opsi-webgui_language.png' })
})
