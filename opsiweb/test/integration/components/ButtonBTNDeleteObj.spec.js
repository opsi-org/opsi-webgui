const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('button delete obj snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-delete-obj', 'btn-delete-obj')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btndeleteobj.png')
})
