const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/opsi-webgui_en.json')
const de = require('../../uib-components/locale/opsi-webgui_de.jsonjsonjsonjsonjsonjson')

test.describe('Client Deletion', () => {
  test('Button', async ({ page }) => {
    await callStoryId(page, 'modal-m-delete-client', 'm-delete-client')
    const component = page.locator('[data-testid="MDeleteClient"]')
    await page.setViewportSize({ width: 140, height: 40 })
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await page.evaluate((val) => { document.querySelector('.clientdeletion').innerHTML = val }, en['button.delete'])
    await component.screenshot({ path: './screenshots/en/opsi-webgui_buttondeletion.png' })
    await page.evaluate((val) => { document.querySelector('.clientdeletion').innerHTML = val }, de['button.delete'])
    await component.screenshot({ path: './screenshots/de/opsi-webgui_buttondeletion.png' })
  })

  test('Modal', async ({ page }) => {
    await callStoryId(page, 'modal-m-delete-client', 'm-delete-client')
    await page.click('[data-testid="MDeleteClient"] .btn')
    await page.setViewportSize({ width: 750, height: 200 })
    const component = page.locator('[data-testid="MDeleteClientModal"] .modal-content')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await page.evaluate((val) => { document.querySelector('.modal-title').innerHTML = val }, en['title.deleteClient'])
    await page.evaluate((val) => { document.querySelector('.confirm').innerHTML = val.replace('{client}', 'testclient.domain.local') }, en['message.confirm.deleteClient'])
    await page.evaluate((val) => { document.querySelector('.deletion').innerHTML = val }, en['button.delete'])
    await component.screenshot({ path: './screenshots/en/opsi-webgui_clientdeletion.png' })
    await page.evaluate((val) => { document.querySelector('.modal-title').innerHTML = val }, de['title.deleteClient'])
    await page.evaluate((val) => { document.querySelector('.confirm').innerHTML = val.replace('{client}', 'testclient.domain.local') }, de['message.confirm.deleteClient'])
    await page.evaluate((val) => { document.querySelector('.deletion').innerHTML = val }, de['button.delete'])
    await component.screenshot({ path: './screenshots/de/opsi-webgui_clientdeletion.png' })
  })
})
