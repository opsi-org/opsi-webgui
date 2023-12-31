const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/opsi-webgui_en.json')
const de = require('../../uib-components/locale/opsi-webgui_de.jsonjsonjson')

test('Login', async ({ page }) => {
  await callStoryId(page, 'form-f-login', 'f-login')
  const component = page.locator('[data-testid="FLogin"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  // await component.evaluate(() => { document.querySelector('.projectTitle').innerHTML = 'opsi-webgui' })
  await page.evaluate((val) => { document.querySelector('[data-testid="login_configserver"]').placeholder = val }, 'testconfigserver.uib.local')
  await page.evaluate((val) => { document.querySelector('.username').placeholder = val }, en['form.username'])
  await page.evaluate((val) => { document.querySelector('.password').placeholder = val }, en['form.password'])
  await page.evaluate((val) => { document.querySelector('.login').innerHTML = val }, en['button.login'])
  await component.screenshot({ path: './screenshots/en/opsi-webgui_login.png' })
  await page.evaluate((val) => { document.querySelector('.username').placeholder = val }, de['form.username'])
  await page.evaluate((val) => { document.querySelector('.password').placeholder = val }, de['form.password'])
  await page.evaluate((val) => { document.querySelector('.login').innerHTML = val }, de['button.login'])
  await component.screenshot({ path: './screenshots/de/opsi-webgui_login.png' })
})
