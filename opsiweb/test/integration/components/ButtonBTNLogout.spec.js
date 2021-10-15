const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('button logout snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-logout', 'btn-logout')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btnlogout.png')
})
