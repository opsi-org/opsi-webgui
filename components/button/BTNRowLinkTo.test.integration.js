const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('button rowlinkto Config snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-row-link-to', 'btn-row-link-to-config')
  const component = await page.locator('[data-testid="ButtonBTNRowLinkTo"]')
  expect(await component.screenshot()).toMatchSnapshot('BTNRowLinkToConfig.png')
})

test('button rowlinkto Log snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-row-link-to', 'btn-row-link-to-log')
  const component = await page.locator('[data-testid="ButtonBTNRowLinkTo"]')
  expect(await component.screenshot()).toMatchSnapshot('BTNRowLinkToLog.png')
})
