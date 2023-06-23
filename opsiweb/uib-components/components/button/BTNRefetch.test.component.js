const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test.describe('snapshot', () => {
  test('refetch button', async ({ page }) => {
    await callStoryId(page, 'button-btn-refetch', 'btn-refetch')
    const component = page.locator('[data-testid="BTNRefetch"]')
    expect(await component.screenshot()).toMatchSnapshot('BTNRefetch.png', { threshold: 0.2 })
  })
})
