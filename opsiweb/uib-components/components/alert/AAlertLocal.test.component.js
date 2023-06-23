const { test, expect } = require('@playwright/test')
const callStoryId = require('../../.utils/playwright/pw-story-call').callStoryId

test.describe('snapshot', () => {
  test('alertlocal', async ({ page }) => {
    await callStoryId(page, 'alert-a-alert-local', 'a-alert-local')
    const component = page.locator('#root')
    expect(await component.screenshot()).toMatchSnapshot('AAlertLocal.png')
  })
})
