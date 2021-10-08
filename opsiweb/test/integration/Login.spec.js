const { test, expect } = require('@playwright/test')

test('show login page', async ({ page }) => {
  await page.goto('./login')
  const title = page.locator('.login_title')
  await expect(title).toHaveText('OPSIWEB')
})

test('show depot', async ({ page }) => {
  // await page.goto('https://localhost:4447/webgui/api/user/opsiserver')
  // content = page.locator('pre')
  // await expect(content).toHaveText('{"result":"bonifax.uib.local"}')

  await page.goto('./login')
  const content = page.locator('.server')
  await expect(content).toHaveAttribute('placeholder', 'bonifax.uib.local')
})

test('page snapshot', async ({ page }) => {
  await page.goto('./login')
  expect(await page.screenshot()).toMatchSnapshot('page-login.png')
})

