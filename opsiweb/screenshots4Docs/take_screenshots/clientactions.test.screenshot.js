const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/opsiweb-ui_en.json')
const de = require('../../uib-components/locale/opsiweb-ui_de.jsonjsonjsonjson')

test.describe('Client Actions', () => {
  test('Button', async ({ page }) => {
    await callStoryId(page, 'dropdown-dd-client-actions', 'dd-client-actions')
    const component = page.locator('[data-testid="DDClientActions"]')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await component.screenshot({ path: './screenshots/en/opsi-webgui_buttonclientactions.png' })
    await component.screenshot({ path: './screenshots/de/opsi-webgui_buttonclientactions.png' })
  })
  test('Dropdown', async ({ page }) => {
    await callStoryId(page, 'dropdown-dd-client-actions', 'dd-client-actions')
    await page.click('[data-testid="DDClientActions"] .btn')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await page.setViewportSize({ width: 240, height: 270 })
    await page.evaluate((val) => { document.querySelector('.ondemand').innerHTML = val }, en['button.event.ondemand'])
    await page.evaluate((val) => { document.querySelector('.showpopup').innerHTML = val }, en['button.event.showpopup'])
    await page.evaluate((val) => { document.querySelector('.reboot').innerHTML = val }, en['button.event.reboot'])
    await page.evaluate((val) => { document.querySelector('.clientagent').innerHTML = val }, en['label.clientagent'])
    await page.evaluate((val) => { document.querySelector('.rename').innerHTML = val }, en['label.rename'])
    await page.evaluate((val) => { document.querySelector('.clientdeletion').innerHTML = val }, en['label.delete'])
    await page.screenshot({ path: './screenshots/en/opsi-webgui_clientactions.png' })
    await page.evaluate((val) => { document.querySelector('.showpopup').innerHTML = val }, de['button.event.showpopup'])
    await page.evaluate((val) => { document.querySelector('.reboot').innerHTML = val }, de['button.event.reboot'])
    await page.evaluate((val) => { document.querySelector('.clientagent').innerHTML = val }, de['label.clientagent'])
    await page.evaluate((val) => { document.querySelector('.rename').innerHTML = val }, de['label.rename'])
    await page.evaluate((val) => { document.querySelector('.clientdeletion').innerHTML = val }, de['label.delete'])
    await page.screenshot({ path: './screenshots/de/opsi-webgui_clientactions.png' })
  })
})
