const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-admin-terminal', async ({ page }) => {
  await callStoryId(page, 'view-v-admin-terminal', 'v-admin-terminal')
  const component = await page.locator('[data-testid="VAdminTerminal"]')
  // wss://localhost:4447/messagebus/v1?
  const cursor = '<span class="xterm-cursor xterm-cursor-blink xterm-cursor-block"> </span>'

  const server = 'opsiconfd@062b112a9628:~$ '
  const id = 'bd0ebec1-6cd2-4a3a-a174-d1c5f432d77c'
  const channel = 'service_worker:ast14:1:terminal'
  await page.locator('#terminalId').fill(id)
  await page.locator('#terminalChannel').fill(channel)
  await page.evaluate((val) => { document.querySelector('.xterm-rows > div:first-child').innerHTML = val }, server + cursor)

  expect(await component.screenshot()).toMatchSnapshot('VAdminTerminal.png')
})
