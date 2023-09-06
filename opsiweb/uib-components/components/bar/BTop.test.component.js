const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test.describe('snapshot', () => {
  test('topbar', async ({ page }) => {
    await callStoryId(page, 'bar-b-top', 'b-top')
    const component = page.locator('[data-testid="BarBTop"]')
    // await page.evaluate(() => { document.querySelector('.topbar_title').innerText = 'TITLE' })
    expect(await component.screenshot()).toMatchSnapshot('BTop.png')
  })
})
