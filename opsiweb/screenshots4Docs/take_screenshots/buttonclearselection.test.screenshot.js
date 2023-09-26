const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
<<<<<<< HEAD
const en = require('../../uib-components/locale/webgui_en.json')
const de = require('../../uib-components/locale/webgui_de.json')
=======
// const en = require('../../uib-components/locale/en.json')
// const de = require('../../uib-components/locale/de.json')
>>>>>>> main

test('Button Clear Selection', async ({ page }) => {
  await callStoryId(page, 'button-btn-clear-selection', 'btn-clear-selection')
  const component = page.locator('[data-testid="BTNClearSelection"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  // await page.evaluate((val) => { document.querySelector('.clearButton').innerHTML = val }, en['table.selection.clear'])
  await component.screenshot({ path: './screenshots/en/opsi-webgui_buttonclearselect.png' })
  // await page.evaluate((val) => { document.querySelector('.clearButton').innerHTML = val }, de['table.selection.clear'])
  await component.screenshot({ path: './screenshots/de/opsi-webgui_buttonclearselect.png' })
})
