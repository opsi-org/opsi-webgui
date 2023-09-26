const { test, expect } = require('@playwright/test')
const callStoryId = require('../../.utils/playwright/pw-story-call').callStoryId

test.describe('snapshot', () => {
  test('alert autodismissible', async ({ page }) => {
    await callStoryId(page, 'alert-a-alertautodismissible', 'a-alert-auto-dismissible')
    const component = page.locator('#root')
    expect(await component.screenshot()).toMatchSnapshot('AAlertAutoDismissible.png')
  })
})
