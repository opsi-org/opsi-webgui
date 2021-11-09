const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('view vclients addnew snapshot', async ({ page }) => {
  await callStoryId(page, 'view-v-clientsaddnew', 'v-clientsaddnew')
  const component = await page.locator('[data-testid="VClientsAddNew"]')
  expect(await component.screenshot()).toMatchSnapshot('view-vclientsaddnew.png')
})
