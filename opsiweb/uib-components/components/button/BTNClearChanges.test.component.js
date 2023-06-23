const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test.describe('snapshot', () => {
  test('button to clear tracked changes', async ({ page }) => {
    await callStoryId(page, 'button-btn-clear-changes', 'btn-clear-changes')
    const component = page.locator('[data-testid="BTNClearChanges"]')
    expect(await component.screenshot()).toMatchSnapshot('BTNClearChanges.png')
  })
})
