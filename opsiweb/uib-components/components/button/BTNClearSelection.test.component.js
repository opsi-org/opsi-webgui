const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test.describe('snapshot', () => {
  test('button to clear selections from table or tree', async ({ page }) => {
    await callStoryId(page, 'button-btn-clear-selection', 'btn-clear-selection')
    const component = page.locator('[data-testid="BTNClearSelection"]')
    expect(await component.screenshot()).toMatchSnapshot('BTNClearSelection.png')
  })
})
