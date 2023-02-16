const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/en.json')
const de = require('../../uib-components/locale/de.json')
test('Quick Save', async ({ page }) => {
  await callStoryId(page, 'view-v-settings-local-specific', 'v-settings-local-specific')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.evaluate((val) => { document.querySelector('.quicksave').innerHTML = val }, en['form.quicksave'])
  await page.screenshot({
    path: './screenshots/en/opsiweb_quicksave.png',
    clip: {
      x: 5,
      y: 55,
      width: 330,
      height: 60
    }
  })
  await page.evaluate((val) => { document.querySelector('.quicksave').innerHTML = val }, de['form.quicksave'])
  await page.screenshot({
    path: './screenshots/de/opsiweb_quicksave.png',
    clip: {
      x: 5,
      y: 55,
      width: 330,
      height: 60
    }
  })
})
