const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('bar bside snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-side', 'b-side')
  expect(await page.screenshot()).toMatchSnapshot('comp-bar-bside.png')
})

test('bar bside expanded snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-side', 'b-side-expanded')
  expect(await page.screenshot()).toMatchSnapshot('comp-bar-bside-expanded.png')
})
