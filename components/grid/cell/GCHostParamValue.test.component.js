const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../../.utils/playwright/pw-story-call')

test('grid cell host parameter bool value snapshot', async ({ page }) => {
  await callStoryId(page, 'gridcell-g-c-host-parameter-value', 'gc-host-param-value-bool')
  const component = await page.locator('[data-testid="GCHostParamBool"]')
  expect(await component.screenshot()).toMatchSnapshot('GCHostParamBool.png')
})

test('grid cell host parameter unicode value snapshot', async ({ page }) => {
  await callStoryId(page, 'gridcell-g-c-host-parameter-value', 'gc-host-param-value-unicode')
  const component = await page.locator('[data-testid="GCHostParamUnicode"]')
  expect(await component.screenshot()).toMatchSnapshot('GCHostParamUnicode.png')
})
