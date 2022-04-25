const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('table-changes snapshot', async ({ page }) => {
  await callStoryId(page, 'table-t-changes', 't-changes')
  const component = await page.locator('[data-testid="TChanges"]')
  expect(await component.screenshot()).toMatchSnapshot('TChanges-close.png')
})

test('table-changes open product snapshot', async ({ page }) => {
  await callStoryId(page, 'table-t-changes', 't-changes')
  await page.click('button[aria-controls="product1"]')
  const component = await page.locator('[data-testid="TChanges"]')
  expect(await component.screenshot()).toMatchSnapshot('TChanges-open.png')
})
