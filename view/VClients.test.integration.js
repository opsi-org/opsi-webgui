const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('view clients snapshot', async ({ page }) => {
  await callStoryId(page, 'view-v-clients', 'v-clients')
  const component = await page.locator('[data-testid="VClients"]')
  expect(await component.screenshot()).toMatchSnapshot('view-vclientsaddnew.png')
})
