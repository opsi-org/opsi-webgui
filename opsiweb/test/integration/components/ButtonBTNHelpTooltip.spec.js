const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('button help tooltip snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-help-tooltip', 'btn-help-tooltip')
  const component = await page.$('[data-testid="BTNHelpTooltip"]')
  expect(await component.screenshot()).toMatchSnapshot('button-btnhelptooltip.png')
})

test('button help tooltip hover snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-help-tooltip', 'btn-help-tooltip')
  await page.hover('[data-testid="BTNHelpTooltip"]')
  // TODO: hover does not work (im sure its a playwright problem.. )
  expect(await page.screenshot()).toMatchSnapshot('button-btnhelptooltip-hover.png')
})
