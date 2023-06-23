const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test.describe('snapshot', () => {
  test('Config button', async ({ page }) => {
    await callStoryId(page, 'button-btn-row-link-to', 'btn-row-link-to-config')
    const component = page.locator('[data-testid="ButtonBTNRowLinkTo"]')
    expect(await component.screenshot()).toMatchSnapshot('BTNRowLinkToConfig.png')
  })

  test('Log button', async ({ page }) => {
    await callStoryId(page, 'button-btn-row-link-to', 'btn-row-link-to-log')
    const component = page.locator('[data-testid="ButtonBTNRowLinkTo"]')
    expect(await component.screenshot()).toMatchSnapshot('BTNRowLinkToLog.png')
  })
})
