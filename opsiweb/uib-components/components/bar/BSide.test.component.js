const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test.describe('snapshot', () => {
  test('sidebar collapsed', async ({ page }) => {
    await callStoryId(page, 'bar-b-side', 'b-side')
    const component = page.locator('[data-testid="BarBSide"]')

    await page.evaluate(() => { document.querySelector('.topbar_version').innerHTML = 'x.x.x' })
    expect(await component.screenshot()).toMatchSnapshot('BSide_small.png')
  })

  test('sidebar authenticated', async ({ page }) => {
    await callStoryId(page, 'bar-b-side', 'b-side-authenticated')
    await page.evaluate(() => { document.querySelector('.DCountdowntimer .timer').innerHTML = 'x:x' })
    await page.evaluate(() => { document.querySelector('.topbar_version').innerHTML = 'x.x.x' })
    expect(await page.screenshot()).toMatchSnapshot('BSide_small-authenticated.png')
  })
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
