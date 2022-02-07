const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('div dcounttimer snapshot expired', async ({ page }) => {
  await callStoryId(page, 'div-d-counttimer', 'd-counttimer')
  const component = await page.locator('[data-testid="DivDCounttimer"]')
  expect(await component.screenshot()).toMatchSnapshot('div-counttimer_expired.png')
})
test('div dcounttimer snapshot expired small', async ({ page }) => {
  await callStoryId(page, 'div-d-counttimer', 'd-counttimer-small')
  const component = await page.locator('[data-testid="DivDCounttimer"]')
  expect(await component.screenshot()).toMatchSnapshot('div-counttimer_expired-small.png')
})
test('div dcounttimer snapshot not expired', async ({ page }) => {
  await callStoryId(page, 'div-d-counttimer', 'd-counttimer-auth')
  const component = await page.locator('[data-testid="DivDCounttimer"]')
  expect(await component.screenshot()).toMatchSnapshot('div-counttimer_auth.png')
})
test('div dcounttimer snapshot not expired small', async ({ page }) => {
  await callStoryId(page, 'div-d-counttimer', 'd-counttimer-auth-small')
  const component = await page.locator('[data-testid="DivDCounttimer"]')
  expect(await component.screenshot()).toMatchSnapshot('div-counttimer_auth-small.png')
})
test('div dcounttimer snapshot not expired but gonna to (toast)', async ({ page }) => {
  await callStoryId(page, 'div-d-counttimer', 'd-counttimer-auth-small')
  const component = await page.locator('[id="MakeToast"]') // this only works if auth-duration < 5min
  expect(await component.screenshot()).toMatchSnapshot('div-counttimer_toast.png')
})
