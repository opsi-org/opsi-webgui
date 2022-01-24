const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-clients-addnew snapshot', async ({ page }) => {
  await callStoryId(page, 'view-v-clients-add-new', 'v-clients-add-new')
  const component = await page.locator('[data-testid="VClientsAddNew"]')
  expect(await component.screenshot()).toMatchSnapshot('view-vclientsaddnew.png')
})
