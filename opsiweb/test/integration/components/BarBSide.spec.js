const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('bar bside snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-side', 'b-side')
  const component = await page.locator('[data-testid="BarBSide"]')
  expect(await component.screenshot()).toMatchSnapshot('bar-bside.png')
})

test('bar bside expanded snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-side', 'b-side-expanded')
  const component = await page.locator('[data-testid="BarBSide"]')
  expect(await component.screenshot()).toMatchSnapshot('bar-bside-expanded.png')
})
