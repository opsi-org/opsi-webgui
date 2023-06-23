const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test.describe('snapshot', () => {
  test('tooltip with collapseable row', async ({ page }) => {
    await callStoryId(page, 'bar-b-tooltip-collapse-row', 'b-tooltip-collapse-row')
    await (new Promise(resolve => setTimeout(resolve, 3000)))
    const component = page.locator('[data-testid="BarBTooltipCollapseRow"]')
    expect(await component.screenshot()).toMatchSnapshot('BTooltipCollapseRow.png', { maxDiffPixelRatio: 0.2 })
  })
})
