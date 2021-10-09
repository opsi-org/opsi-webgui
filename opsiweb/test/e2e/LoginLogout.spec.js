const { test, expect } = require('@playwright/test')
const apiMock = (page, apiPath, response) => page.route(apiPath, route => route.fulfill({
  status: 200,
  headers: { 'access-control-allow-origin': '*' },
  contentType: 'application/json',
  body: JSON.stringify(response)
}))

test.beforeEach(async ({ page }) => {
  const apiServerPath = '**/api/user/opsiserver'
  await page.unroute(apiServerPath)
  await apiMock(page, apiServerPath, { result: 'mydepot.uib.local' })
  await page.goto('./login')
})

test('login and logout again', async ({ page }) => {
  // await page.goto('./login')
  title = page.locator('.server')
  await expect(title).toHaveAttribute('placeholder', 'mydepot.uib.local')

  await page.click('[placeholder="Username"]')
  await page.fill('[placeholder="Username"]', 'adminuser')
  await page.press('[placeholder="Username"]', 'Tab')
  await page.fill('[placeholder="Password"]', 'adminuser')
  await page.press('[placeholder="Password"]', 'Enter')
  await page.waitForNavigation({ url: './' })

  await page.click('[data-testid="btn-logout"]')
  await page.waitForNavigation({ url: './login' })
  title = page.locator('.login_title')
  await expect(title).toHaveText('OPSIWEB')
})
