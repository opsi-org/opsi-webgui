const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('bar bside small snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-side', 'b-side-small')
  const component = await page.locator('[data-testid="BarBSide"]')
  expect(await component.screenshot()).toMatchSnapshot('bar-bside_small.png')
})

test('bar bside small authenticated snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-side', 'b-side-small-authenticated')
  // const component = await page.locator('[data-testid="BarBSide"]')
  expect(await page.screenshot()).toMatchSnapshot('bar-bside_small-authenticated.png')
})

// expanded
test('bar bside expanded snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-side', 'b-side-expanded')
  const component = await page.locator('[data-testid="BarBSide"]')
  expect(await component.screenshot()).toMatchSnapshot('bar-bside_expanded.png')
})

test('bar bside expanded authenticated snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-side', 'b-side-expanded-authenticated')
  // const component = await page.locator('[data-testid="BarBSide"]')
  expect(await page.screenshot()).toMatchSnapshot('bar-bside_expanded-authenticated.png')
})
