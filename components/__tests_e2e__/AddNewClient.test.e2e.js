const { test, expect } = require('@playwright/test')
const { apiMock, cookieOpsiconfdSession } = require('../../.utils/playwright/pw-api-mock')

test.beforeEach(async ({ page }) => {
  await page.unroute('**/api/**')
  await apiMock(page, '**/api/user/opsiserver', { result: 'mydepot.uib.local' })
  // await apiMock(page, '**/api/auth/login', { result: 'Login success' })
  // await apiMock(page, '**/api/auth/logout', { result: 'logout success' })
  // await page.goto('./clientsaddnew')
})

test('create a new opsi client', async ({ page }) => {
  await page.goto('./clientsaddnew')
  // TODO Check if Add button is disabled when no ID.
  // TODO Fillout complete form, click on RESET and check if it resets the form
  // TODO Check default domain name is from configserver
  // TODO Fillout complete form, click on ADD and expect alert, also check clients table and filter by newClients ID.
  // TODO: Check with already existing client ID and expect alert
})
