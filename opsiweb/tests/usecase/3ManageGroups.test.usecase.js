const { test, expect } = require('@playwright/test')
const { apiMock, cookieOpsiconfdSession } = require('../../uib-components/.utils/playwright/pw-api-mock')
test.beforeEach(async ({ page, context }) => {
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
    { clientId: 'client1.uib.local', ident: 'client1.uib.local', macAddress: 'af:fe:af:fe:af:f1', description: '', notes: '', version_outdated: 0, installationStatus_unknown: 0, installationStatus_installed: 0, actionResult_failed: 0, actionResult_successful: 0, selected: 0 }
  ])
  await (new Promise(resolve => setTimeout(resolve, 2000)))
  await expect(page).toHaveURL('/addons/webgui/app/clients/')
  await page.click('[data-testid="NIItem-title.groups"]')
  await expect(page).toHaveURL('/addons/webgui/app/groups/')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
})

test.afterEach(async ({ page }) => {
  apiMock(page, '**/api/auth/logout', { result: 'logout success' }, 'POST')
  await page.click('[data-testid="ButtonBTNLogout"]')
  page.setDefaultTimeout(55555)
  await expect(page).toHaveURL('/addons/webgui/app/login')
  await page.close()
})

test.describe('usecase', () => {
  test.describe('Groups', () => {
    test('Add Client', async ({ page }) => {
      await page.getByText('clientdirectory').click()
      await page.getByText('testclient').click()
      await (new Promise(resolve => setTimeout(resolve, 1000)))
      await page.click('[data-testid="addClientsToSelectedGroup"]')
      await (new Promise(resolve => setTimeout(resolve, 1000)))
      await expect(page.getByTestId('groupAlert')).toContainText('testclient')
      await expect(page.getByTestId('groupAlert')).toHaveClass('alert alertbar alert-dismissible alert-success')
    })

    test('Create subgroup', async ({ page }) => {
      await page.getByText('clientdirectory').click()
      await page.click('[data-testid="subgroup"]')
      await page.type('[placeholder="Subgroup Name"]', 'testsubgroup')
      await page.press('[placeholder="Subgroup Name"]', 'Tab')
      await page.type('[placeholder="Description"]', 'This is a test group.')
      await page.click('[data-testid="createSubGroup"]')
      await (new Promise(resolve => setTimeout(resolve, 1000)))
      await expect(page.getByTestId('groupAlert')).toContainText('testsubgroup')
      await expect(page.getByTestId('groupAlert')).toHaveClass('alert alertbar alert-dismissible alert-success')
    })

    test('Update group', async ({ page }) => {
      await page.getByText('testsubgroup').click()
      await page.getByText('Update group').click()
      await page.type('[placeholder="Description"]', 'This is the updated description for the test group.')
      await page.click('[data-testid="updateGroup"]')
      await (new Promise(resolve => setTimeout(resolve, 1000)))
      await expect(page.getByTestId('groupAlert')).toContainText('testsubgroup')
      await expect(page.getByTestId('groupAlert')).toHaveClass('alert alertbar alert-dismissible alert-success')
    })

    test('Remove Clients', async ({ page }) => {
      await page.getByText('testsubgroup').click()
      await page.getByText('Remove clients').click()
      await page.click('[data-testid="removeClientAssignments"]')
      await (new Promise(resolve => setTimeout(resolve, 1000)))
      await expect(page.getByTestId('groupAlert')).toContainText('Removed all clients from testsubgroup')
      await expect(page.getByTestId('groupAlert')).toHaveClass('alert alertbar alert-dismissible alert-success')
    })

    test('Delete group', async ({ page }) => {
      await page.getByText('testsubgroup').click()
      await page.getByText('Delete group').click()
      await page.click('[data-testid="deleteGroup"]')
      await (new Promise(resolve => setTimeout(resolve, 1000)))
      await expect(page.getByTestId('groupAlert')).toContainText('Deleted group testsubgroup')
      await expect(page.getByTestId('groupAlert')).toHaveClass('alert alertbar alert-dismissible alert-success')
    })
  })
})
