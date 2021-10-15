const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('button open modal snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-open-modal', 'btn-open-modal')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btnopenmodal.png')
})
