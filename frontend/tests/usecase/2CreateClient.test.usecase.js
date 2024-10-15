import { test, expect } from '@playwright/test'
import { apiMock } from '../../tests-configs/playwright/utils/pw-api-mock'
import { pageLogin } from '../../tests-configs/playwright/utils/pw-global-setup'

test.beforeEach(async ({ page, context }) => {

  await pageLogin(page, context, async () => {
    await apiMock(page, '**/api/user/configuration', {"user":"adminuser","configuration":{"read_only":false,"depot_access":false,"host_group_access":false,"product_group_access":false,"client_creation":true, 'dummy': 'dummy'}})
    await apiMock(page, '**/api/opsidata/server/disabled-features', [])
    await apiMock(page, '**/api/opsidata/depots/clients?selectedDepots=[testconfigserver.uib.local]', ['client1.uib.local', 'client2.uib.local', 'client3.uib.local', 'client4.uib.local', 'client5.uib.local'])
    await apiMock(page, '**/api/opsidata/depot_ids', ['testconfigserver.uib.local', 'depot1.uib.local', 'depot2.uib.local', 'depot3.uib.local'])
    // await apiMock(page, '**/api/opsidata/clients?pageNumber=1&perPage=15&sortBy=clientId&sortDesc=false&filterQuery=&selected=&selectedDepots=["testconfigserver.uib.local"]&selectedClients=[]', [
    //   { clientId: 'client1.uib.local', ident: 'client1.uib.local', macAddress: 'af:fe:af:fe:af:f1', description: '', notes: '', version_outdated: 0, installationStatus_unknown: 0, installationStatus_installed: 0, actionResult_failed: 0, actionResult_successful: 0, selected: 0 },
    //   { clientId: 'client2.uib.local', ident: 'client2.uib.local', macAddress: 'af:fe:af:fe:af:f2', description: '', notes: '', version_outdated: 2, installationStatus_unknown: 2, installationStatus_installed: 2, actionResult_failed: 2, actionResult_successful: 2, selected: 0 },
    //   { clientId: 'client3.uib.local', ident: 'client3.uib.local', macAddress: 'af:fe:af:fe:af:f3', description: '', notes: '', version_outdated: 3, installationStatus_unknown: 3, installationStatus_installed: 3, actionResult_failed: 3, actionResult_successful: 3, selected: 0 },
    //   { clientId: 'client4.uib.local', ident: 'client4.uib.local', macAddress: 'af:fe:af:fe:af:f4', description: '', notes: '', version_outdated: 4, installationStatus_unknown: 4, installationStatus_installed: 4, actionResult_failed: 4, actionResult_successful: 4, selected: 0 },
    //   { clientId: 'client5.uib.local', ident: 'client5.uib.local', macAddress: 'af:fe:af:fe:af:f5', description: '', notes: '', version_outdated: 5, installationStatus_unknown: 5, installationStatus_installed: 5, actionResult_failed: 5, actionResult_successful: 5, selected: 0 }
    // ])
  })
  await expect(page).toHaveURL('/addons/webgui/app/clients')
})

test.afterEach(async ({ page }) => {
  // await pageLogout(page)
  await page.close()
})
test.describe('usecase', () => {
  test('Create Client', async ({ page }) => {
    try {
      await page.getByTestId('menu_routes').click({ timeout: 3000 })
    }catch {
      // console.log('menu_routes not found. (ok for desktop)')
    }
    await page.click('[data-testid="NSidebar-title.clients"]')
    await page.click('[data-testid="NICollapsible-submenu-title.addNew"]')
    await expect(page).toHaveURL('/addons/webgui/app/clients/create')

    const elInput = await page.getByTestId('hostId')
    await elInput.scrollIntoViewIfNeeded();
    await elInput.fill('testclient')
    await page.getByTestId('clientCreate_addButton').click()

    await (new Promise(resolve => setTimeout(resolve, 200)))
    await expect(page.locator('.el-notification')).toContainText('has been added succesfully.')

    await page.locator('.el-notification__closeBtn').click()
    await (new Promise(resolve => setTimeout(resolve, 200)))
  })
})
