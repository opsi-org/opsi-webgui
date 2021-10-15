const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('button help tooltip snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-help-tooltip', 'btn-help-tooltip')
  // const element = await page.$('[data-testid="BTNHelpTooltip"]')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btnhelptooltip.png')
})

test('button help tooltip hover snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-help-tooltip', 'btn-help-tooltip')
  await page.hover('[data-testid="BTNHelpTooltip"]')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btnhelptooltip-hover.png')
})
