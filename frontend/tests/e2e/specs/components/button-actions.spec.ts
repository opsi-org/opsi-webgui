import { test, expect, type Page, type TestInfo, type WebSocketRoute } from '@playwright/test'
import { encode } from '@msgpack/msgpack'
import { openSettings, setLocale, setTheme } from '../../utils/ui'

async function capture(page: Page, testInfo: TestInfo, name: string) {
  const path = testInfo.outputPath(`${name}.png`)
  await page.screenshot({ path, animations: 'disabled' })
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
    if (!localStorage.getItem('opsi-webgui-color-mode')) localStorage.setItem('opsi-webgui-color-mode', theme)
    if (!localStorage.getItem('opsi-webgui-ui'))
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

test.describe('global settings', () => {
  let socket: WebSocketRoute

  test.beforeEach(async ({ page }) => {
    await page.routeWebSocket('**/messagebus/v1', (ws) => {
      socket = ws
    })
  })

  test('navigation entry, focus and Quickpanel separation', async ({ page }) => {
    await page.goto(`${appPath}/clients`)
    const url = page.url()
    const close = await openSettings(page)
    await expect(page.getByTestId('quickpanel')).toBeHidden()
    expect(page.url()).toBe(url)
    const dialog = page.getByRole('dialog')
    await expect(dialog).toHaveAccessibleName('Settings')
    for (let index = 0; index < 12; index++) {
      await page.keyboard.press('Tab')
      expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true)
    }
    await page.getByTestId('language-select').click()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('listbox')).toBeHidden()
    await expect(dialog).toBeVisible()
    await page.getByTestId('default-page-select').click()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('listbox')).toBeHidden()
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(page.getByTestId('settings-toggle')).toBeFocused()
    await page.getByTestId('settings-toggle').press('Enter')
    await expect(dialog).toBeVisible()
    await close()

    await page.locator('header button[aria-expanded]').first().click()
    const closeExpanded = await openSettings(page)
    await expect(dialog).toBeVisible()
    await closeExpanded()
    await page.getByTestId('quickpanel-toggle').click()
    await expect(page.getByTestId('quickpanel')).toBeVisible()
    await expect(page.getByTestId('quickpanel-settings-section')).toHaveCount(0)
    await expect(page.getByTestId('quickpanel-quick-actions-section')).toBeVisible()
    await expect(page.getByTestId('quickpanel-footer-section')).toContainText('ui-test')
    await expect(page.getByTestId('quickpanel-footer-section').getByRole('button', { name: 'Logout', exact: true })).toBeVisible()
    await expect(page.getByTestId('session-timer')).toBeVisible()
    await expect(page.getByTestId('quickpanel').getByRole('tab')).toHaveCount(4)
  })

  test('existing preferences, immediate changes and reload persistence', async ({ page, context, baseURL }, testInfo) => {
    await context.addCookies([{ name: 'opsi-webgui-default-page', value: '/products', url: new URL(baseURL!).origin }])
    await page.addInitScript(() => {
      if (!localStorage.getItem('opsi-webgui-messagebus'))
        localStorage.setItem('opsi-webgui-messagebus', JSON.stringify({ autoRefresh: false }))
    })
    await page.goto(`${appPath}/clients`)
    let close = await openSettings(page)
    await expect(page.getByTestId('default-page-select')).toContainText('Products')
    const refresh = page.getByTestId('auto-refresh-checkbox')
    await expect(refresh).not.toBeChecked()
    const connectionStatus = page.locator('header [aria-label*="Messagebus"]')
    await expect(connectionStatus).toHaveAttribute('aria-label', 'opsi-Messagebus connected')
    await refresh.check()
    await expect(connectionStatus).toHaveAttribute('aria-label', 'opsi-Messagebus connected')
    await refresh.uncheck()
    await expect(connectionStatus).toHaveAttribute('aria-label', 'opsi-Messagebus connected')
    await page.getByTestId('default-page-select').click()
    await page.getByRole('option', { name: 'Dashboard', exact: true }).click()
    await expect(page.locator('header a').first()).toHaveAttribute('href', `${appPath}/dashboard`)
    await expect(page).toHaveURL(new RegExp(`${appPath}/clients$`))
    const theme = testInfo.project.use.colorScheme === 'dark' ? 'light' : 'dark'
    await setTheme(page, theme)
    await expect(page.getByTestId('settings-dialog')).toBeVisible()
    await setLocale(page, 'de')
    await expect(page.getByRole('dialog')).toHaveAccessibleName('Einstellungen')
    await close()
    await page.reload()
    close = await openSettings(page)
    await expect(page.getByTestId('language-select')).toContainText('Deutsch')
    await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${theme}\\b`))
    await expect(page.getByTestId('default-page-select')).toContainText('Dashboard')
    await expect(page.getByTestId('auto-refresh-checkbox')).not.toBeChecked()
    await close()
    await page.locator('header a').first().click()
    await expect(page).toHaveURL(new RegExp(`${appPath}/dashboard$`))
  })

  test('translations fit, helpers restore overlays, and status follows connection', async ({ page }, testInfo) => {
    await page.goto(`${appPath}/clients`)
    for (const locale of ['en', 'de', 'fr'] as const) {
      await setLocale(page, locale)
      await expect(page.getByTestId('settings-dialog')).toBeHidden()
      if ((page.viewportSize()?.width ?? 0) < 768)
        await expect(page.locator('header button[aria-expanded]').first()).toHaveAttribute('aria-expanded', 'false')
      const close = await openSettings(page)
      for (const id of ['language-select', 'theme-select', 'default-page-select', 'settings-close']) {
        await expect(page.getByTestId(id)).toBeInViewport()
      }
      const dialog = page.getByRole('dialog')
      expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
      await expect(dialog.getByTestId('settings-connection-status')).toHaveCount(0)
      await expect(dialog.getByRole('status')).toHaveCount(0)
      await expect(dialog.getByRole('alert')).toHaveCount(0)
      await expect(dialog).not.toContainText(/opsi-Messagebus/i)
      await capture(page, testInfo, `settings-${locale}`)
      await close()
    }
    await setLocale(page, 'en')
    const close = await openSettings(page)
    const connectionStatus = page.locator('header [aria-label*="Messagebus"]')
    await expect(connectionStatus).toHaveAttribute('aria-label', 'opsi-Messagebus connected')
    await socket.close()
    await expect(connectionStatus).toHaveAttribute('aria-label', 'opsi-Messagebus disconnected')
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('status')).toHaveCount(0)
    await expect(dialog.getByRole('alert')).toHaveCount(0)
    await expect(dialog).not.toContainText(/opsi-Messagebus/i)
    await close()
    await setTheme(page, 'dark')
    await expect(page.getByTestId('settings-dialog')).toBeHidden()
  })

  test('refresh switch retains automatic reload and changes-detected behavior', async ({ page }) => {
    await page.goto(`${appPath}/clients`)
    await expect(page.locator('[id="clients-row-alpha.test.local"]')).toBeVisible()
    let close = await openSettings(page)
    await expect(page.locator('header [aria-label*="Messagebus"]')).toHaveAttribute('aria-label', 'opsi-Messagebus connected')
    await page.getByTestId('auto-refresh-checkbox').check()
    await close()
    const nextLoad = page.waitForResponse(
      (response) => response.url().includes('/opsidata/clients') && response.request().method() === 'GET',
    )
    socket.send(Buffer.from(encode({ type: 'event', event: 'host_updated', channel: 'event:host_updated' })))
    await nextLoad
    close = await openSettings(page)
    await page.getByTestId('auto-refresh-checkbox').uncheck()
    await close()
    let loads = 0
    page.on('request', (request) => {
      if (request.url().includes('/opsidata/clients') && request.method() === 'GET') loads++
    })
    socket.send(Buffer.from(encode({ type: 'event', event: 'host_updated', channel: 'event:host_updated' })))
    await expect(page.getByTestId('page-refresh-button')).toHaveAccessibleName('Changes detected.')
    await page.waitForTimeout(2500)
    expect(loads).toBe(0)
  })

  test('read-only users can change personal settings', async ({ page }) => {
    await page.route('**/addons/webgui/api/user/configuration', (route) =>
      route.fulfill({
        json: { user: 'ui-test', configuration: { read_only: true, server_write_access: false, client_creation: false } },
      }),
    )
    await page.goto(`${appPath}/clients`)
    await setTheme(page, 'dark')
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
    await expect(page.getByRole('button', { name: 'New', exact: true })).toBeDisabled()
    await page.getByTestId('quickpanel-toggle').click()
    await expect(page.getByTestId('quickpanel-footer-section')).toContainText(/Read.only/i)
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
