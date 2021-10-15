const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('bar bpageheader snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-tooltip-collapse-row', 'b-tooltip-collapse-row')
  expect(await page.screenshot()).toMatchSnapshot('comp-bar-btooltipcollapserow.png')
})
