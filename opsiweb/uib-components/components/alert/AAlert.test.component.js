const { test, expect } = require('@playwright/test')
const callStoryId = require('../../.utils/playwright/pw-story-call').callStoryId

test.describe('snapshot', () => {
  test('alert', async ({ page }) => {
    await callStoryId(page, 'alert-a-alert', 'a-alert')
    const component = page.locator('#root')
    expect(await component.screenshot()).toMatchSnapshot('AAlert.png')
  })
})
