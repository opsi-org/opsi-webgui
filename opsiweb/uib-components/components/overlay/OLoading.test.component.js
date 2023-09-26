const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('snapshot > overlay loading', async ({ page }) => {
  await callStoryId(page, 'overlay-loading', 'loading')
  expect(await page.screenshot()).toMatchSnapshot('OLoading.png')
})
