const { test, expect } = require('@playwright/test')

test('button help tooltip snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=button-btn-help-tooltip--btn-help-tooltip&args=&viewMode=story')
  // const element = await page.$('[data-testid="BTNHelpTooltip"]')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btnhelptooltip.png')
})

test('button help tooltip hover snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=button-btn-help-tooltip--btn-help-tooltip&args=&viewMode=story')
  await page.hover('[data-testid="BTNHelpTooltip"]')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btnhelptooltip-hover.png')
})
