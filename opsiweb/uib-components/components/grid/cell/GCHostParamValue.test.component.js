const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../../.utils/playwright/pw-story-call')

test('host parameter bool value', async ({ page }) => {
  await callStoryId(page, 'gridcell-g-c-host-parameter-value', 'gc-host-param-value-bool')
  const component = page.locator('[data-testid="GCHostParamBool"]')
  expect(await component.screenshot()).toMatchSnapshot('GCHostParamBool.png')
})

test('host parameter unicode value', async ({ page }) => {
  await callStoryId(page, 'gridcell-g-c-host-parameter-value', 'gc-host-param-value-unicode')
  const component = page.locator('[data-testid="GCHostParamUnicode"]')
  expect(await component.screenshot()).toMatchSnapshot('GCHostParamUnicode.png')
})
