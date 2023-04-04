const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('tooltip-help snapshot', async ({ page }) => {
  await callStoryId(page, 'tooltip-tt-help', 'tt-help')
  await page.hover('#target')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  // await page.waitForSelector("[data-testid='TTHelp']")
  // const component = await page.locator('[data-testid="TTHelpExpert"]')
  expect(await page.screenshot()).toMatchSnapshot('TTHelp.png')
})
