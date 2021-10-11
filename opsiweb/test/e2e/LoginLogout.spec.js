const { test, expect } = require('@playwright/test')
const apiMock = (page, apiPath, response, withCookie = true) => {
  page.route(apiPath, route => route.fulfill({
    status: 200,
    headers: {
      'access-control-allow-origin': 'https://localhost:8888',
      'access-control-allow-credentials': true,
      'access-control-allow-headers': '*',
      'access-control-allow-methods': '*'
      // 'set-cookie': (!withCookie) ? '' : 'opsiconfd-session=any-value; domain=localhost; path=/; sameSite=None; secure=true'
    },
    contentType: 'application/json',
    body: JSON.stringify(response)
  }))
}

const cookieOpsiconfdSession = [{
  name: 'opsiconfd-session',
  value: 'any-value',
  domain: 'localhost',
  path: '/',
  expires: -1,
  httpOnly: false,
  secure: true,
  sameSite: 'None'
}]

test.beforeEach(async ({ page }) => {
  page.on('console', m => console.log(m.text()))
  page.on('requestfailed', request => (!request.url().includes('4447')) ? '' : console.log(`>>f ${request.method()} ${request.url()} ${JSON.stringify(request.failure())}`))
  page.on('request', request => {
    if (request.url().includes('4447')) {
      console.log(`>> ${request.method()} ${request.url()}`)
    }
  })
  page.on('response', async response => {
    if (response.url().includes('4447')) {
      let txt = (await response.body()).toString()
      console.log(`<< ${response.status()} ${response.url()} ${txt}`)
    }
  })
  await page.unroute('**/api/**')
  await apiMock(page, '**/api/user/opsiserver', { result: 'mydepot.uib.local' })
  await apiMock(page, '**/api/auth/login', { result: 'Login success' })
  await apiMock(page, '**/api/auth/logout', { result: 'logout success' })
  await page.goto('./login')
})

test('should be possible to login and logout again', async ({ page, context }) => {
  // await page.goto('./login')
  title = page.locator('.login_title')
  await expect(title).toHaveText('OPSIWEB')
  title = page.locator('.server')
  await expect(title).toHaveAttribute('placeholder', 'mydepot.uib.local')

  await page.click('[placeholder="Username"]')
  await page.fill('[placeholder="Username"]', 'adminuser')
  await page.press('[placeholder="Username"]', 'Tab')
  await page.fill('[placeholder="Password"]', 'adminuser')
  await page.press('[placeholder="Password"]', 'Enter')

  await context.addCookies(cookieOpsiconfdSession)
  title = await context.cookies()
  expect(title).toEqual(cookieOpsiconfdSession)

  await page.waitForNavigation({ url: './' })
  title = page.locator('[data-testid="btn-logout"]')
  await expect(title).toHaveText('Logout')

  await apiMock(page, '**/api/auth/logout', { result: 'logout success' }, 'POST')
  await page.click('[data-testid="btn-logout"]')
  await page.waitForNavigation({ url: './login' })
  title = page.locator('.login_title')
  await expect(title).toHaveText('OPSIWEB')
})
