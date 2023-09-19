const { test, expect } = require('@playwright/test')
const { apiMock, cookieOpsiconfdSession } = require('../../uib-components/.utils/playwright/pw-api-mock')

test.describe('usecase', () => {
  test('Create Client', async ({ page, context }) => {
    await page.unroute('**/api/**')
    apiMock(page, '**/api/user/opsiserver', { result: 'testconfigserver.uib.local' })
    await page.goto('./login')
    // const title = page.locator('[data-testid="login_title"]')
    // await expect(title).toHaveText('opsi-webgui')
    await page.type('[placeholder="Username"]', 'adminuser')
    await page.press('[placeholder="Username"]', 'Tab')
    await page.type('[placeholder="Password"]', 'adminuser')
    await page.press('[placeholder="Password"]', 'Enter')
    apiMock(page, '**/api/auth/login', { result: 'Login success' })
    await context.addCookies(cookieOpsiconfdSession)
    const session = await context.cookies()
    expect(session).toEqual(cookieOpsiconfdSession)
    apiMock(page, '**/api/opsidata/depots/clients?selectedDepots=[testconfigserver.uib.local]', ['client1.uib.local', 'client2.uib.local', 'client3.uib.local', 'client4.uib.local', 'client5.uib.local'])
    apiMock(page, '**/api/opsidata/depot_ids', ['testconfigserver.uib.local', 'depot1.uib.local', 'depot2.uib.local', 'depot3.uib.local'])
    apiMock(page, '**/api/opsidata/clients?pageNumber=1&perPage=15&sortBy=clientId&sortDesc=false&filterQuery=&selected=&selectedDepots=["testconfigserver.uib.local"]&selectedClients=[]', [
      { clientId: 'client1.uib.local', ident: 'client1.uib.local', macAddress: 'af:fe:af:fe:af:f1', description: '', notes: '', version_outdated: 0, installationStatus_unknown: 0, installationStatus_installed: 0, actionResult_failed: 0, actionResult_successful: 0, selected: 0 },
      { clientId: 'client2.uib.local', ident: 'client2.uib.local', macAddress: 'af:fe:af:fe:af:f2', description: '', notes: '', version_outdated: 2, installationStatus_unknown: 2, installationStatus_installed: 2, actionResult_failed: 2, actionResult_successful: 2, selected: 0 },
      { clientId: 'client3.uib.local', ident: 'client3.uib.local', macAddress: 'af:fe:af:fe:af:f3', description: '', notes: '', version_outdated: 3, installationStatus_unknown: 3, installationStatus_installed: 3, actionResult_failed: 3, actionResult_successful: 3, selected: 0 },
      { clientId: 'client4.uib.local', ident: 'client4.uib.local', macAddress: 'af:fe:af:fe:af:f4', description: '', notes: '', version_outdated: 4, installationStatus_unknown: 4, installationStatus_installed: 4, actionResult_failed: 4, actionResult_successful: 4, selected: 0 },
      { clientId: 'client5.uib.local', ident: 'client5.uib.local', macAddress: 'af:fe:af:fe:af:f5', description: '', notes: '', version_outdated: 5, installationStatus_unknown: 5, installationStatus_installed: 5, actionResult_failed: 5, actionResult_successful: 5, selected: 0 }
    ])
    await (new Promise(resolve => setTimeout(resolve, 2000)))
    await expect(page).toHaveURL('/addons/webgui/app/clients/')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await page.click('[data-testid="NSidebar-title.clients"]')
    await page.click('[data-testid="NICollapsible-submenu-title.addNew"]')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await expect(page).toHaveURL('/addons/webgui/app/clientscreation')
    await page.getByTestId('clientname').fill('testclient')
    await page.getByTestId('addButton').click()
    await expect(page.getByTestId('statusAlert')).toContainText('has been added succesfully.')
    apiMock(page, '**/api/auth/logout', { result: 'logout success' }, 'POST')
    await page.click('[data-testid="ButtonBTNLogout"]')
    page.setDefaultTimeout(55555)
    await expect(page).toHaveURL('/addons/webgui/app/login')
    await page.close()
  })
})
