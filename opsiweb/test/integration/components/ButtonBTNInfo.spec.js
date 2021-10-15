const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('button info snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-info', 'btn-info')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btninfo.png')
})
