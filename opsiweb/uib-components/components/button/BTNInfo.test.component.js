const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test.describe('snapshot', () => {
  test('info button', async ({ page }) => {
    await callStoryId(page, 'button-btn-info', 'btn-info')
    const component = page.locator('[data-testid="ButtonBTNInfo"]')
    expect(await component.screenshot()).toMatchSnapshot('BTNInfo.png')
  })
})
