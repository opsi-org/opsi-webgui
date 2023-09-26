// global-setup.js
const { data } = require('./pw-api-mock-data')

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



module.exports.mockEveryThing = (test, expect) => {
  // ///////////////////////////////////////////////////////////////////////////////////
  const mockData = async ({ page }) => {
    await page.unroute('**/api/**')
    await page.route('**/api/**', (route) => {
      console.log('ROUTE NOT MOCKED: \t\t', route._parent._initializer.url)
      route.abort()
    })
    apiMock(page, '**/api/user/opsiserver', { result: data.depotIds[0] })
    apiMock(page, '**/api/user/configuration', { user: 'adminuser', configuration: { read_only: false, depot_access: false, host_group_access: false, product_group_access: false, client_creation: true } })
    apiMock(page, '**/api/opsidata/hosts/groups/id', ['clientdirectory', 'testgroup', 'test'])

    apiMock(page, '**/api/opsidata/hosts?**', data.hostObjAttributes)
    apiMock(page, '**/api/opsidata/hosts/groups?**', { groups: data.groups.groups, clientdirectory: data.groups.clientdirectory })
    apiMock(page, '**/api/opsidata/hosts/groups-dynamic?**', { groups: {} })
    apiMock(page, '**/api/opsidata/depots/products?**', [])
    apiMock(page, '**/api/opsidata/depot_ids', [...data.depotIds, 'foooooooo'])
    apiMock(page, '**/api/opsidata/depots/clients?**', data.clientIds)
    apiMock(page, '**/api/opsidata/depots/clients?selectedDepots=[' + data.selectedClientDepot + ']', data.clientIds)
    apiMock(page, '**/api/opsidata/depots?**', data.depotObjs)
    apiMock(page, '**/api/opsidata/servers?**', data.serverAttribute)
    apiMock(page, '**/api/opsidata/clients?**', data.clientObj)
    apiMock(page, '**/api/opsidata/groups-dynamic**', { groups: data.groups })
    apiMock(page, '**/api/opsidata/products/installation-status', [null, 'successful', 'failed', 'unknown'])
    apiMock(page, '**/api/opsidata/products/action-result', [null, 'failed', 'successful'])

    apiMock(page, '**/api/opsidata/clientsdepots?**', { selectedClient: data.selectedClientDepot })
    apiMock(page, '**/api/opsidata/products**', data.clientProducts, { 'access-control-expose-headers': 'x-total-count', 'x-total-count': data.clientProducts.length })
    apiMock(page, '**/api/opsidata/products/groups**', { groups: data.groups.procutgroups })
    // apiMock(page, '**/api/opsidata/products/count?**&type=LocalbootProduct', clientProducts.length)
    apiMock(page, '**/api/opsidata/products/count**', 24)
    apiMock(page, '**/api/auth/login', { result: 'Login success' })
    apiMock(page, '**/api/auth/logout', { result: 'logout success' }, 'POST')

  // mock.onGet('/api/opsidata/depot_ids**').reply(200, data.depotIds)
  // mock.onGet('/api/opsidata/depots/clients**').reply(200, data.clientIds)
  // mock.onGet('/api/opsidata/depots/clients**').reply(200, data.clientIds)
  // mock.onGet('/api/opsidata/products/groups**').reply(200, { groups: data.groups.procutgroups })
  // mock.onGet('/api/opsidata/products/action-result').reply(200, [])
  // mock.onGet('/api/opsidata/products/installation-status').reply(200, [])
  // mock.onGet('/api/opsidata/hosts/groups-dynamic**').reply(200, { groups: data.groups.hostgroups })
  }
  // ///////////////////////////////////////////////////////////////////////////////////
  test.beforeEach(async ({ page, context }) => {
    // page.setDefaultTimeout(55555)
    await mockData({ page })

    await page.goto('./login')
    // const title = page.locator('.tableheader_title')
    // await expect(title).toHaveText('Clients')
    await page.type('[placeholder="Username"]', 'adminuser')
    await page.press('[placeholder="Username"]', 'Tab')
    await page.type('[placeholder="Password"]', 'adminuser')
    await page.press('[placeholder="Password"]', 'Enter')
    await context.addCookies(cookieOpsiconfdSession)
    expect(await context.cookies()).toEqual(cookieOpsiconfdSession)

    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await expect(page).toHaveURL('/addons/webgui/app/clients/')
    // console.log('PAGEURL beforeEach:', page.url())
  })

  test.afterEach(async ({ page }) => {
    if (page.url().includes('/app/login')) { return }

    // need to logout
    await expect(page).not.toHaveURL('/addons/webgui/app/login')
    await page.click('[data-testid="btnQuickPanel"]:not(.active)')
    await page.click('[data-testid="ButtonBTNLogout"]')

    page.setDefaultTimeout(55555)
    await expect(page).toHaveURL('/addons/webgui/app/login')
    await page.close()
  })
}