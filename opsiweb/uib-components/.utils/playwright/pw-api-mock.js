// global-setup.js
// const { chromium } = require('@playwright/test');
const apiMock = (page, apiPath, response, additionalHeaders={}, consigserverName='testconfigserver') => {
  page.route(apiPath, route => {
    // console.log('MYROUTE: \t', route._parent._initializer.url)
    route.fulfill({
      status: 200,
      headers: {
        'access-control-allow-origin': 'https://localhost:8888',
        'access-control-allow-credentials': true,
        'access-control-allow-headers': '*',
        'access-control-allow-methods': '*',
        'x-date-unix-timestamp': Date.now().valueOf(),
        'x-opsi-server-role': 'configserver',
        'x-opsi-worker-id': consigserverName + ":1",
        ...additionalHeaders
        // 'set-cookie': (!withCookie) ? '' : 'opsiconfd-session=any-value; domain=localhost; path=/; sameSite=None; secure=true'
      },
      contentType: 'application/json',
      body: JSON.stringify(response)
    })
  })
}
module.exports.apiMock = apiMock

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

module.exports.cookieOpsiconfdSession = cookieOpsiconfdSession




module.exports.pageLogout = async ({ page, expect }) => {
  await expect(page).not.toHaveURL('/addons/webgui/app/login')
  console.log('PAGEURL afterEach:', page.url())

  // await page.screenshot({ path: './screenshots/.tmp/opsi-webgui_' + '' + '_.png' })

  // await page.click('[data-testid="btnQuickPanel"]:not(.active)')
  // await page.click('[data-testid="ButtonBTNLogout"]')
  // apiMock(page, '**/api/auth/logout', { result: 'logout success' }, 'POST')

  // page.setDefaultTimeout(55555)
  // await expect(page).toHaveURL('/addons/webgui/app/login')
  // await page.close()
}



