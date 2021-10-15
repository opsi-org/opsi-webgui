const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')
test('bar bpageheader snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-page-header', 'b-page-header')
  expect(await page.screenshot()).toMatchSnapshot('comp-bar-bpageheader.png')
})
