const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('card support snapshot', async ({ page }) => {
  await callStoryId(page, 'card-c-support', 'c-support')
  expect(await page.screenshot()).toMatchSnapshot('comp-card-csupport.png')
})
