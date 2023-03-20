const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/en.json')
const de = require('../../uib-components/locale/de.json')

test.describe('Client Notify', () => {
  test('Button', async ({ page }) => {
    await callStoryId(page, 'button-btn-event', 'btn-event-notify')
    const component = await page.locator('[data-testid="BTNEvent"]')
    await page.setViewportSize({ width: 140, height: 40 })
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await page.evaluate((val) => { document.querySelector('.eventlabel').innerHTML = val }, en['button.event.showpopup'])
    await component.screenshot({ path: './screenshots/en/opsi-webgui_buttonnotify.png' })
    await page.evaluate((val) => { document.querySelector('.eventlabel').innerHTML = val }, de['button.event.showpopup'])
    await component.screenshot({ path: './screenshots/de/opsi-webgui_buttonnotify.png' })
  })

  test('Modal', async ({ page }) => {
    await callStoryId(page, 'button-btn-event', 'btn-event-notify')
    await page.click('[data-testid="BTNEvent"] .btn')
    await page.setViewportSize({ width: 750, height: 350 })
    const component = await page.locator('[data-testid="BTNEventModal"] .modal-content')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await page.evaluate((val) => { document.querySelector('.modal-title').innerHTML = val }, en['button.event.showpopup'])
    await page.evaluate((val) => { document.querySelector('.textarea').value = val }, en['button.event.showpopup.message'])
    await page.evaluate((val) => { document.querySelector('.footer').innerHTML = val }, en['button.event.modal.footer'])
    await page.evaluate((val) => { document.querySelector('.confirm').innerHTML = val }, en['button.confirm'])
    await component.screenshot({ path: './screenshots/en/opsi-webgui_clientnotify.png' })
    await page.evaluate((val) => { document.querySelector('.modal-title').innerHTML = val }, de['button.event.showpopup'])
    await page.evaluate((val) => { document.querySelector('.textarea').value = val }, de['button.event.showpopup.message'])
    await page.evaluate((val) => { document.querySelector('.footer').innerHTML = val }, de['button.event.modal.footer'])
    await page.evaluate((val) => { document.querySelector('.confirm').innerHTML = val }, de['button.confirm'])
    await component.screenshot({ path: './screenshots/de/opsi-webgui_clientnotify.png' })
  })
})
