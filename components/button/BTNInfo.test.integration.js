const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('button info snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-info', 'btn-info')
  const component = await page.locator('[data-testid="ButtonBTNInfo"]')
  expect(await component.screenshot()).toMatchSnapshot('button-btninfo.png')
})
