

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
  // mock webgui version
  await page.evaluate(() => { document.querySelector('.BAuthFooter-version').innerHTML = 'x.x.x' })
  // const version = page.('.BarBAauthFooter .navbar-text text="version"').
  // console.log('TESTING VERSION ' + version)
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
  // test.fail(browserName === 'webkit', 'This feature currently has problems on webkit')
  await new Promise(resolve => setTimeout(resolve, 1000))
  const content = await page.screenshot()
  expect(content).toMatchSnapshot('pages-login.png')
  // TODO: Webkit broken
})
