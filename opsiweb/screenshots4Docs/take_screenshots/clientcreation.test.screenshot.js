const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/en.json')
const de = require('../../uib-components/locale/de.json')

test('Client creation', async ({ page }) => {
  await callStoryId(page, 'view-v-client-creation', 'v-client-creation')
  const component = await page.locator('[data-testid="VClientCreation"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.evaluate((val) => { document.querySelector('.id').innerHTML = val }, en['table.fields.id'])
  await component.evaluate(() => { document.querySelector('.domainName').placeholder = '.domain.local' })
  await page.evaluate((val) => { document.querySelector('.basics').innerHTML = val }, en['title.basics'])
  await page.evaluate((val) => { document.querySelector('.description').innerHTML = val }, en['table.fields.description'])
  await page.evaluate((val) => { document.querySelector('.inventNum').innerHTML = val }, en['table.fields.inventNum'])
  await page.evaluate((val) => { document.querySelector('.hwAddr').innerHTML = val }, en['table.fields.hwAddr'])
  await page.evaluate((val) => { document.querySelector('.ip').innerHTML = val }, en['table.fields.ip'])
  await page.evaluate((val) => { document.querySelector('.notes').innerHTML = val }, en['table.fields.notes'])
  await page.evaluate((val) => { document.querySelector('.settings').innerHTML = val }, en['title.settings'])
  await page.evaluate((val) => { document.querySelector('.uefi').innerHTML = val }, en['table.fields.uefi'])
  await page.evaluate((val) => { document.querySelector('.assignments').innerHTML = val }, en['title.assignments'])
  await page.evaluate((val) => { document.querySelector('.depot').innerHTML = val }, en['table.fields.depot'])
  await page.evaluate((val) => { document.querySelector('.group').innerHTML = val }, en['table.fields.group'])
  await page.evaluate((val) => { document.querySelector('.initsetup').innerHTML = val }, en['title.initsetup'])
  await page.evaluate((val) => { document.querySelector('.netbootproduct').innerHTML = val }, en['table.fields.netbootproduct'])
  await page.evaluate((val) => { document.querySelector('.clientagent').innerHTML = val }, en['table.fields.clientagent'])
  await page.evaluate((val) => { document.querySelector('.resetButton').innerHTML = val }, en['button.reset'])
  await page.evaluate((val) => { document.querySelector('.addButton').innerHTML = val }, en['button.create'])
  // await page.screenshot({
  //   path: './screenshots/en/opsiweb_clientcreation.png',
  //   clip: {
  //     x: 0,
  //     y: 85,
  //     width: 1200,
  //     height: 1700
  //   }
  // })

  await component.screenshot({ path: './screenshots/en/opsiweb_clientcreation.png' })
  await page.evaluate((val) => { document.querySelector('.description').innerHTML = val }, de['table.fields.description'])
  await page.evaluate((val) => { document.querySelector('.inventNum').innerHTML = val }, de['table.fields.inventNum'])
  await page.evaluate((val) => { document.querySelector('.settings').innerHTML = val }, de['title.settings'])
  await page.evaluate((val) => { document.querySelector('.notes').innerHTML = val }, de['table.fields.notes'])
  await page.evaluate((val) => { document.querySelector('.assignments').innerHTML = val }, de['title.assignments'])

  await page.evaluate((val) => { document.querySelector('.resetButton').innerHTML = val }, de['button.reset'])
  await page.evaluate((val) => { document.querySelector('.addButton').innerHTML = val }, de['button.create'])
  await component.screenshot({ path: './screenshots/de/opsiweb_clientcreation.png' })
})
