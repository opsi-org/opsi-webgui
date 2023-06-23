const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-clients', async ({ page }) => {
  await callStoryId(page, 'view-v-clients', 'v-clients')
  const component = page.locator('[data-testid="VClients"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  expect(await component.screenshot()).toMatchSnapshot('VClients-main.png')
})

test('view-clients with contextmenu', async ({ page }) => {
  await callStoryId(page, 'view-v-clients', 'v-clients')
  const component = page.locator('[data-testid="VClients"]')
  await component.locator('tbody > tr[aria-rowindex="1"]').click({ button: 'right' })
  expect(await component.screenshot()).toMatchSnapshot('VClients-contextmenu.png')
})
