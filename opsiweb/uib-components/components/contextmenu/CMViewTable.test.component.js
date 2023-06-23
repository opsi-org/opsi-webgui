const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test.describe('snapshot', () => {
  test('context menu openend', async ({ page }) => {
    await callStoryId(page, 'contextmenu-cm-view-table', 'cm-view-table')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    expect(await page.screenshot()).toMatchSnapshot('CMViewTable-open.png', { maxDiffPixelRatio: 0.2 })
  })

  test('context menu closed', async ({ page }) => {
    await callStoryId(page, 'contextmenu-cm-view-table', 'cm-view-table')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await page.click('[data-testid="CMViewTable"] > .right-click-backdrop')
    expect(await page.screenshot()).toMatchSnapshot('CMViewTable-closed.png', { maxDiffPixelRatio: 0.2 })
  })
})
