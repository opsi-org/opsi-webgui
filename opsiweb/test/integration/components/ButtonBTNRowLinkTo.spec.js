const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('button rowlinkto snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-row-link-to', 'btn-row-link-to')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btnrowlinkto.png')
})
