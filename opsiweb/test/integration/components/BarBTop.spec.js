const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('bar btop snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-top', 'b-top')
  expect(await page.screenshot()).toMatchSnapshot('comp-bar-btop.png')
})
