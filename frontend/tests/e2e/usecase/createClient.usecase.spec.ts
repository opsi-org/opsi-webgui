import { test, expect } from '@playwright/test'
import { apiMock } from '../../tests-configs/playwright/utils/pw-api-mock'
import { pageLogin } from '../../tests-configs/playwright/utils/pw-global-setup'

test.beforeEach(async ({ page, context }) => {
  await pageLogin(page, context, async () => {
    await apiMock(page, '**/api/user/configuration', {
      user: 'adminuser',
      configuration: {
        read_only: false,
        depot_access: false,
        host_group_access: false,
        product_group_access: false,
        client_creation: true,
        dummy: 'dummy',
      },
    })
    await apiMock(page, '**/api/opsidata/server/disabled-features', [])
    await apiMock(
      page,
      '**/api/opsidata/depots/clients?selectedDepots=[testconfigserver.uib.local]',
      [
        'client1.uib.local',
        'client2.uib.local',
        'client3.uib.local',
        'client4.uib.local',
        'client5.uib.local',
      ]
    )
    await apiMock(page, '**/api/opsidata/depot_ids', [
      'testconfigserver.uib.local',
      'depot1.uib.local',
      'depot2.uib.local',
      'depot3.uib.local',
    ])
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
    } catch {
      // console.log('menu_routes not found. (ok for desktop)')
    }
    await page.click('[data-testid="NSidebar-title.clients"]')
    await page.click('[data-testid="NICollapsible-submenu-title.addNew"]')
    await expect(page).toHaveURL('/addons/webgui/app/clients/create')

    const elInput = await page.getByTestId('hostId')
    await elInput.scrollIntoViewIfNeeded()
    await elInput.fill('testclient')
    await page.getByTestId('clientCreate_addButton').click()

    await new Promise((resolve) => setTimeout(resolve, 200))
    await expect(page.locator('.el-notification')).toContainText('has been added succesfully.')

    await page.locator('.el-notification__closeBtn').click()
    await new Promise((resolve) => setTimeout(resolve, 200))
  })
})
