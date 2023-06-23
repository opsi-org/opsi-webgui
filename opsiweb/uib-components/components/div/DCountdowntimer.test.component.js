const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('countdown timer when expired', async ({ page }) => {
  await callStoryId(page, 'div-d-counttimer', 'd-counttimer')
  const component = page.locator('[data-testid="DivDCounttimer"]')
  expect(await component.screenshot()).toMatchSnapshot('DCountdowntimer-21expired.png')
})
test('small countdown timer when expired', async ({ page }) => {
  await callStoryId(page, 'div-d-counttimer', 'd-counttimer-small')
  const component = page.locator('[data-testid="DivDCounttimer"]')
  expect(await component.screenshot()).toMatchSnapshot('DCountdowntimer-22expired-small.png')
})
test('countdown timer when not expired', async ({ page }) => {
  await callStoryId(page, 'div-d-counttimer', 'd-counttimer-auth')
  const component = page.locator('[data-testid="DivDCounttimer"]')
  expect(await component.screenshot()).toMatchSnapshot('DCountdowntimer-11auth.png')
})
test('small countdown timer when not expired', async ({ page }) => {
  await callStoryId(page, 'div-d-counttimer', 'd-counttimer-auth-small')
  await page.evaluate(() => { document.querySelector('.DCountdowntimer .timer').innerHTML = 'xm xs' })
  const component = page.locator('[data-testid="DivDCounttimer"]')
  expect(await component.screenshot()).toMatchSnapshot('DCountdowntimer-12auth-small.png')
})
// todo: test if expired alert works
// test('div dcounttimer snapshot not expired but gonna to (toast)', async ({ page }) => {
//   await callStoryId(page, 'div-d-counttimer', 'd-counttimer-auth-small')
//   const component = await page.locator('.b-toaster-slot') // this only works if auth-duration < 5min
//   expect(await component.screenshot()).toMatchSnapshot('DCountdowntimer-toast.png')
// })
