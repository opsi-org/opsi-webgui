const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('button delete all snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-delete-all', 'btn-delete-all')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btndeleteall.png')
})
