const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('table-collapseableformobile snapshot', async ({ page }) => {
  await callStoryId(page, 'table-t-collapseableformobile', 't-collapseable-for-mobile')
  const component = await page.locator('[data-testid="TCollapseableForMobile"]')
  expect(await component.screenshot()).toMatchSnapshot('table-collapseableformobile.png')
})
