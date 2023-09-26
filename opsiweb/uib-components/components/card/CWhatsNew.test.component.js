const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('snapshot > card whatsnew', async ({ page }) => {
  await callStoryId(page, 'card-c-whatsnew', 'c-whatsnew')
  expect(await page.screenshot()).toMatchSnapshot('CWhatsNew.png')
})
