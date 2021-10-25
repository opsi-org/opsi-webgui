const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')
test('alert default snapshot', async ({ page }) => {
  await callStoryId(page, 'alert-a-alert', 'a-alert')
  const component = await page.locator('#root')
  expect(await component.screenshot()).toMatchSnapshot('alert-aalert.png')
})
