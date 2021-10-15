const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')
test('bar bauthfooter snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-auth-footer', 'b-auth-footer')
  expect(await page.screenshot()).toMatchSnapshot('comp-bar-bauthfooter.png')
})
