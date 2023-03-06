const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/en.json')
const de = require('../../uib-components/locale/de.json')

test.describe('Client Reboot', () => {
  test('Button', async ({ page }) => {
    await callStoryId(page, 'button-btn-event', 'btn-event-reboot')
    const component = await page.locator('[data-testid="BTNEvent"]')
    await page.setViewportSize({ width: 140, height: 40 })
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await page.evaluate((val) => { document.querySelector('.eventlabel').innerHTML = val }, en['button.event.reboot'])
    await component.screenshot({ path: './screenshots/en/opsiweb_buttonclientreboot.png' })
    await page.evaluate((val) => { document.querySelector('.eventlabel').innerHTML = val }, de['button.event.reboot'])
    await component.screenshot({ path: './screenshots/de/opsiweb_buttonclientreboot.png' })
  })
  test('Modal', async ({ page }) => {
    await callStoryId(page, 'button-btn-event', 'btn-event-reboot')
    await page.click('[data-testid="BTNEvent"] .btn')
    await page.setViewportSize({ width: 750, height: 300 })
    const component = await page.locator('[data-testid="BTNEventModal"] .modal-content')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await page.evaluate((val) => { document.querySelector('.modal-title').innerHTML = val }, en['button.event.reboot'])
    await page.evaluate((val) => { document.querySelector('.footer').innerHTML = val }, en['button.event.modal.footer'])
    await page.evaluate((val) => { document.querySelector('.confirm').innerHTML = val }, en['button.confirm'])
    await component.screenshot({ path: './screenshots/en/opsiweb_clientreboot.png' })
    await page.evaluate((val) => { document.querySelector('.modal-title').innerHTML = val }, de['button.event.reboot'])
    await page.evaluate((val) => { document.querySelector('.footer').innerHTML = val }, de['button.event.modal.footer'])
    await page.evaluate((val) => { document.querySelector('.confirm').innerHTML = val }, de['button.confirm'])
    await component.screenshot({ path: './screenshots/de/opsiweb_clientreboot.png' })
  })
})
