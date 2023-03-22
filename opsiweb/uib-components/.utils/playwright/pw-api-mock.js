// global-setup.js
// const { chromium } = require('@playwright/test');

module.exports.apiMock = (page, apiPath, response) => {
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

module.exports.cookieOpsiconfdSession = [{
  name: 'opsiconfd-session',
  value: 'any-value',
  domain: 'localhost',
  path: '/',
  expires: -1,
  httpOnly: false,
  secure: true,
  sameSite: 'None'
}]
