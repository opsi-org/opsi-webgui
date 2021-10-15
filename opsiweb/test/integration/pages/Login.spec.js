const { test, expect } = require('@playwright/test')
const apiMock = (page, apiPath, response) => page.route(apiPath, route => route.fulfill({
  status: 200,
  headers: {
    'access-control-allow-origin': 'https://localhost:8888',
    'access-control-allow-credentials': true,
    'access-control-allow-headers': '*',
    'access-control-allow-methods': '*'
  },
  contentType: 'application/json',
  body: JSON.stringify(response)
}))

test.beforeEach(async ({ page }) => {
  const apiServerPath = '**/api/user/opsiserver'
  await page.unroute(apiServerPath)
  await apiMock(page, apiServerPath, { result: 'mydepot.uib.local' })
  await page.goto('./login')
  await page.waitForURL('./login')
})

test('login page return title opsiweb', async ({ page }) => {
  const title = page.locator('.login_title')
  await expect(title).toHaveText('OPSIWEB')
})

test('login page return mocked depot', async ({ page }) => {
  const content = page.locator('.server')
  await expect(content).toHaveAttribute('placeholder', 'mydepot.uib.local')
})

test('login page snapshot is matching', async ({ page }) => {
  const content = await page.screenshot()
  expect(content).toMatchSnapshot('pages-login.png')
  // TODO: Webkit broken
})
