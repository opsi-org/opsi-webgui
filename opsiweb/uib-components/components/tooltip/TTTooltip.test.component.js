const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('tooltip snapshot', async ({ page }) => {
  await callStoryId(page, 'tooltip-t-t-tooltip', 'tt-tooltip')
  await page.hover('#target')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  expect(await page.screenshot()).toMatchSnapshot('TTTooltip.png')
})
