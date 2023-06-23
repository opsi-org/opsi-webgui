const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test.describe('snapshot', () => {
  test('reset button', async ({ page }) => {
    await callStoryId(page, 'button-btn-reset', 'btn-reset')
    const component = page.locator('[data-testid="ButtonBTNReset"]')
    expect(await component.screenshot()).toMatchSnapshot('BTNReset.png', { threshold: 0.1 })
  })
})
