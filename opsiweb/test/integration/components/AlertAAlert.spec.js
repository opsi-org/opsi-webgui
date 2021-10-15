const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')
test('alert default snapshot', async ({ page }) => {
  await callStoryId(page, 'alert-aalert', 'aalert')
  expect(await page.screenshot()).toMatchSnapshot('comp-alert-aalert.png')
})
