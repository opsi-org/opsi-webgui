const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('tooltip-productcell snapshot', async ({ page }) => {
  await callStoryId(page, 'tooltip-tt-product-cell', 'tt-product-cell')
  await page.hover('#target')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  expect(await page.screenshot()).toMatchSnapshot('TTProductCell.png', { threshold: 0.2 })
})
