const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('button help snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-help', 'btn-help')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btnhelp.png')
})
