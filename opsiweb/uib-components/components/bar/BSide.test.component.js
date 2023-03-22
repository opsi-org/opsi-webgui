const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

// expanded on mobile - collapsed on desktop
test('bar bside snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-side', 'b-side')
  const component = await page.locator('[data-testid="BarBSide"]')
  // await component.evaluate(() => { document.querySelector('.DCountdowntimer .timer').innerHTML = 'x:x' })
  expect(await component.screenshot()).toMatchSnapshot('BSide_small.png')
})

test('bar bside authenticated snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-side', 'b-side-authenticated')
  await page.evaluate(() => { document.querySelector('.DCountdowntimer .timer').innerHTML = 'x:x' })
  // const component = await page.locator('[data-testid="BarBSide"]')
  expect(await page.screenshot()).toMatchSnapshot('BSide_small-authenticated.png')
})

// // expanded
// test('bar bside expanded snapshot', async ({ page }) => {
//   await callStoryId(page, 'bar-b-side', 'b-side')
//   const component = await page.locator('[data-testid="BarBSide"]')
//   expect(await component.screenshot()).toMatchSnapshot('BSide_expanded.png')
// })

// test('bar bside expanded authenticated snapshot', async ({ page }) => {
//   await callStoryId(page, 'bar-b-side', 'b-side-authenticated')
//   // const component = await page.locator('[data-testid="BarBSide"]')
//   expect(await page.screenshot()).toMatchSnapshot('BSide_expanded-authenticated.png')
// })
