const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test.describe('snapshot', () => {
  test('button to delete object from list', async ({ page }) => {
    await callStoryId(page, 'button-btn-delete-obj', 'btn-delete-obj')
    const component = page.locator('[data-testid="ButtonBTNDeleteObj"]')
    expect(await component.screenshot()).toMatchSnapshot('BTNDeleteObj.png')
  })
})
