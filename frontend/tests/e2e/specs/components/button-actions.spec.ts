import { test, expect, type Page, type TestInfo } from '@playwright/test'

async function capture(page: Page, testInfo: TestInfo, name: string) {
  const path = testInfo.outputPath(`${name}.png`)
  await page.screenshot({ path })
  await testInfo.attach(name, { path, contentType: 'image/png' })
}

const appPath = '/addons/webgui/app'
const clients = ['alpha.test.local', 'beta.test.local'].map((clientId, index) => ({
  clientId,
  description: index ? 'Notebook' : 'Workstation',
  ipAddress: `192.0.2.${index + 10}`,
  depotId: 'config.test.local',
  macAddress: `00:11:22:33:44:0${index}`,
  lastSeen: '2026-10-22T12:00:00Z',
  reachable: true,
}))

test.beforeEach(async ({ page, context, baseURL }, testInfo) => {
  await context.addCookies([
    { name: 'opsiconfd-session', value: 'button-actions-test', url: new URL(baseURL!).origin },
    { name: 'opsi-webgui-user-locale', value: 'en', url: new URL(baseURL!).origin },
  ])
  await page.addInitScript((theme) => {
    if (window.top !== window.self) return
    localStorage.setItem('opsi-webgui-color-mode', theme)
    localStorage.setItem('opsi-webgui-ui', JSON.stringify({ quickpanelOpened: false, menuCollapsed: true }))
    localStorage.setItem(
      'opsi-webgui-user',
      JSON.stringify({
        username: 'ui-test',
        usernameUpdated: Date.now(),
        sessionExpiry: 3600,
        sessionEndTime: new Date(Date.now() + 3600000).toISOString(),
      }),
    )
  }, testInfo.project.use.colorScheme || 'light')
  await page.route('**/addons/webgui/api/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname
    let data: unknown = []
    if (pathname.endsWith('/user/opsiserver')) data = 'config.test.local'
    else if (pathname.endsWith('/user/configuration'))
      data = {
        user: 'ui-test',
        configuration: {
          read_only: false,
          server_write_access: true,
          client_creation: true,
          health: { counts: { ok: 2 }, worst_case: 'ok' },
        },
      }
    else if (pathname.endsWith('/opsidata/depots'))
      data = [{ depotId: 'config.test.local', type: 'OpsiConfigserver', description: 'Test depot' }]
    else if (pathname.endsWith('/opsidata/clients')) data = clients
    else if (/groups|icons/.test(pathname)) data = {}
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'X-Total-Count': String(Array.isArray(data) ? data.length : 1) },
      body: JSON.stringify(data),
    })
  })
})

for (const view of ['clients', 'products', 'servers']) {
  test(`${view} toolbar actions share dimensions across groups`, async ({ page }) => {
    await page.goto(`${appPath}/${view}`)
    const refresh = page.getByTestId('page-refresh-button')
    await expect(refresh).toBeVisible()
    await expect(refresh).toBeEnabled()
    const actions = page
      .locator('.page-header button:not([role="tab"])')
      .or(page.getByTestId('table-settings'))
      .or(page.getByTestId('filters-and-saved-searches'))
    await expect(page.getByTestId('table-settings')).toBeVisible()
    const expectedHeight = (await refresh.boundingBox())!.height
    for (const action of await actions.all()) {
      const bounds = await action.boundingBox()
      expect(bounds!.height, await action.getAttribute('aria-label')).toBe(expectedHeight)
      const icon = action.locator('[data-slot="leadingIcon"]')
      if (await icon.count()) await expect(icon).toHaveCSS('width', '16px')
    }
    for (const action of [refresh, page.getByTestId('table-settings'), page.getByTestId('filters-and-saved-searches')]) {
      const bounds = await action.boundingBox()
      expect(bounds!.width, await action.getAttribute('aria-label')).toBe(bounds!.height)
    }

    if (view === 'clients') {
      await page.locator('[id="clients-row-alpha.test.local"] input[type="checkbox"]').check()
      const selectedOnly = page.getByTestId('show-only-selected')
      const clearSelection = page.locator('.data-table').getByRole('button', { name: '1', exact: true })
      for (const action of [selectedOnly, clearSelection]) {
        await expect(action).toBeVisible()
        expect((await action.boundingBox())!.height).toBe(expectedHeight)
      }
      const bounds = await selectedOnly.boundingBox()
      expect(bounds!.width).toBe(bounds!.height)
      await selectedOnly.click()
      expect(await selectedOnly.boundingBox()).toEqual(bounds)
    }
  })
}

test('header and navigation controls remain visually borderless', async ({ page }) => {
  await page.goto(`${appPath}/clients`)
  const sidebarToggle = page.getByRole('button', { name: 'Toggle Sidebar', exact: true })
  const controls = [sidebarToggle, page.getByTestId('global-search'), page.getByTestId('quickpanel-toggle')]
  for (const control of controls) {
    await expect(control).toBeVisible()
    await expect(control).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)')
    await expect(control).toHaveCSS('box-shadow', 'none')
    await expect(control).toHaveCSS('color', 'rgb(255, 255, 255)')
  }
  await sidebarToggle.click()
  const administration = page.getByRole('complementary', { name: 'Navigation' }).getByRole('button', { name: 'Admin', exact: true })
  await expect(administration).toBeVisible()
  await expect(administration).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)')
  await expect(administration).toHaveCSS('box-shadow', 'none')
  await administration.focus()
  await administration.press('Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(administration).toBeFocused()
  await expect(administration).toHaveCSS('outline-style', 'solid')
})

test('row selection and open panel remain independent', async ({ page }, testInfo) => {
  await page.goto(`${appPath}/clients`)
  const firstRow = page.locator('[id="clients-row-alpha.test.local"]')
  const secondRow = page.locator('[id="clients-row-beta.test.local"]')
  await firstRow.locator('input[type="checkbox"]').check()
  await expect(firstRow).toHaveAttribute('aria-selected', 'true')
  await expect(firstRow.getByTestId('client-row-action-config')).toHaveAttribute('aria-expanded', 'false')
  await expect(firstRow.getByTestId('client-row-action-config')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(firstRow).toHaveCSS('box-shadow', 'none')
  await capture(page, testInfo, 'selected-row')

  await secondRow.getByTestId('client-row-action-config').click()
  await expect(page.getByTestId('detail-panel')).toBeVisible()
  await expect(secondRow).toHaveAttribute('aria-selected', 'false')
  await expect(secondRow.getByTestId('client-row-action-config')).toHaveAttribute('aria-expanded', 'true')
  await expect(firstRow.getByTestId('client-row-action-config')).toHaveAttribute('aria-expanded', 'false')
  await expect(secondRow).not.toHaveClass(/bg-\(--color-primary-soft-bg\)/)
  const selectedTab = page.getByRole('tab', { selected: true })
  await expect(selectedTab).toHaveCount(1)
  await expect(selectedTab).toHaveCSS('color', 'rgb(255, 255, 255)')
  await expect(selectedTab).toHaveCSS('background-color', 'rgb(63, 90, 166)')
  const inactiveTab = page.getByRole('tab', { selected: false })
  await expect(inactiveTab).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(inactiveTab).toHaveCSS('border-top-width', '0px')
  await inactiveTab.hover()
  await expect(inactiveTab).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await capture(page, testInfo, 'open-panel')
})

test('toggles expose state and keep stable geometry', async ({ page }, testInfo) => {
  await page.goto(`${appPath}/clients`)
  const toggle = page.locator('button[aria-pressed]').first()
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  const bounds = await toggle.boundingBox()
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await expect(toggle).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  expect(await toggle.boundingBox()).toEqual(bounds)
  await toggle.press('Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(toggle).toHaveCSS('outline-style', 'solid')
  await page.getByTestId('table-settings').click()
  const settings = page.locator('[role="dialog"][aria-label="Table Settings"]')
  const settingsBounds = await settings.boundingBox()
  expect(settingsBounds!.x).toBeGreaterThanOrEqual(0)
  expect(settingsBounds!.x + settingsBounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width)
  await expect(settings.locator('button[aria-pressed="true"]')).toHaveCount(2)
  await expect(settings.locator('button[aria-pressed="false"]')).toHaveCount(2)
  await capture(page, testInfo, 'table-toggles')
})

test('disabled commands retain command styling', async ({ page }) => {
  await page.route('**/api/user/configuration*', (route) =>
    route.fulfill({
      json: {
        user: 'ui-test',
        configuration: { read_only: true, client_creation: false },
      },
    }),
  )
  await page.goto(`${appPath}/clients`)
  const command = page.getByRole('button', { name: 'New', exact: true })
  await expect(command).toBeDisabled()
  await expect(command).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(command).toHaveCSS('border-top-style', 'solid')
})

test('restore requires warning confirmation before transferring data', async ({ page }, testInfo) => {
  const transfers: string[] = []
  await page.route('**/file-transfer/**', async (route) => {
    transfers.push(route.request().url())
    await route.abort()
  })
  await page.goto(`${appPath}/admin/maintenance`)
  await page
    .locator('input[type="file"]')
    .setInputFiles({ name: 'backup.msgpack', mimeType: 'application/octet-stream', buffer: Buffer.from('test') })
  await page.getByRole('button', { name: 'Restore Backup', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('overwrite existing server data')
  await expect(dialog.getByRole('button', { name: 'Restore Backup', exact: true })).toHaveClass(/bg-\(--color-warning\)/)
  expect(transfers).toHaveLength(0)
  await capture(page, testInfo, 'restore-confirmation')
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(dialog).toBeHidden()
  expect(transfers).toHaveLength(0)
})
