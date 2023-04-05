const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('icon opsilogo snapshot', async ({ page }) => {
  await callStoryId(page, 'icon-i-table-column', 'i-table-column')
  const component = await page.locator('[data-testid="ITableColumn"]')
  expect(await component.screenshot()).toMatchSnapshot('ITableColumn.png', { threshold: 0.1 })
})
