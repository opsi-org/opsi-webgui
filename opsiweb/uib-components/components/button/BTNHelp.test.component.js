const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test.describe('snapshot', () => {
  test('help button', async ({ page }) => {
    await callStoryId(page, 'button-btn-help', 'btn-help')
    const component = page.locator('[data-testid="ButtonBTNHelp"]')
    expect(await component.screenshot()).toMatchSnapshot('BTNHelp.png')
  })
})
