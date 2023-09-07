const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/webgui_en.json')
const de = require('../../uib-components/locale/webgui_de.json')

test('Quick Save', async ({ page }) => {
  await callStoryId(page, 'checkbox-c-b-quick-save', 'cb-quick-save')
  await (new Promise(resolve => setTimeout(resolve, 3000)))
  await page.evaluate((val) => { document.querySelector('label>.text-small').innerHTML = val }, en['form.quicksave'])
  await page.screenshot({
    path: './screenshots/en/opsi-webgui_quicksave.png',
    clip: {
      x: 5,
      y: 55,
      width: 350,
      height: 60
    }
  })
  await page.evaluate((val) => { document.querySelector('label>.text-small').innerHTML = val }, de['form.quicksave'])
  await page.screenshot({
    path: './screenshots/de/opsi-webgui_quicksave.png',
    clip: {
      x: 5,
      y: 55,
      width: 350,
      height: 60
    }
  })
})
