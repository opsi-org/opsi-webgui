const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/opsiweb-ui_en.json')
const de = require('../../uib-components/locale/opsiweb-ui_de.json')

test.describe('Client Deploy Agent', () => {
  test('Button', async ({ page }) => {
    await callStoryId(page, 'modal-m-deploy-client-agent', 'm-deploy-client-agent')
    const component = page.locator('[data-testid="MDeployClientAgent"]')
    await page.setViewportSize({ width: 200, height: 40 })
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await page.evaluate((val) => { document.querySelector('.clientagent').innerHTML = val }, en['label.clientagent'])
    await component.screenshot({ path: './screenshots/en/opsi-webgui_buttondeployagent.png' })
    await page.evaluate((val) => { document.querySelector('.clientagent').innerHTML = val }, de['label.clientagent'])
    await component.screenshot({ path: './screenshots/de/opsi-webgui_buttondeployagent.png' })
  })
  test('Modal', async ({ page }) => {
    await callStoryId(page, 'modal-m-deploy-client-agent', 'm-deploy-client-agent')
    await page.click('[data-testid="MDeployClientAgent"] .btn')
    await page.setViewportSize({ width: 750, height: 450 })
    const component = page.locator('[data-testid="MDeployClientAgentModal"] .modal-content')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await page.evaluate((val) => { document.querySelector('.modal-header').innerHTML = val }, en['label.clientagent'])
    // await page.evaluate((val) => { document.querySelector('.clientId').innerHTML = val }, 'Client ID: client1.domain.local')
    await page.evaluate((val) => { document.querySelector('.username').innerHTML = val }, en['form.username'])
    await page.evaluate((val) => { document.querySelector('.password').innerHTML = val }, en['form.password'])
    await page.evaluate((val) => { document.querySelector('.type').innerHTML = val }, en['table.fields.type'])
    await page.evaluate((val) => { document.querySelector('.deploy').innerHTML = val }, en['button.confirm'])
    await component.screenshot({ path: './screenshots/en/opsi-webgui_clientdeployagent.png' })
    await page.evaluate((val) => { document.querySelector('.modal-header').innerHTML = val }, de['label.clientagent'])
    await page.evaluate((val) => { document.querySelector('.username').innerHTML = val }, de['form.username'])
    await page.evaluate((val) => { document.querySelector('.password').innerHTML = val }, de['form.password'])
    await page.evaluate((val) => { document.querySelector('.type').innerHTML = val }, de['table.fields.type'])
    await page.evaluate((val) => { document.querySelector('.deploy').innerHTML = val }, de['button.confirm'])
    await component.screenshot({ path: './screenshots/de/opsi-webgui_clientdeployagent.png' })
  })
})
