const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('button help snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-help', 'btn-help')
  const component = await page.locator('[data-testid="ButtonBTNHelp"]')
  expect(await component.screenshot()).toMatchSnapshot('button-btnhelp.png')
})
