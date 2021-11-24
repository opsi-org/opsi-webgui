const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('tree clients not stored snapshot', async ({ page }) => {
  await callStoryId(page, 'tree-t-s-clients', 'ts-clients-not-stored')
  const component = await page.locator('[data-testid="TSClientsNotStored"]')
  expect(await component.screenshot()).toMatchSnapshot('tree-tsclientsnotstored.png')
})
