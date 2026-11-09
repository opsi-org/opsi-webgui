/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 */

/**
 * User-permission UI states (read-only / restricted users).
 *
 * The backend enforces permissions server-side (read_only_check,
 * filter_depot_access, ...). These tests verify the FRONTEND presentation
 * of those restrictions by mocking /api/user/configuration — no real
 * restricted user account is needed and the shared backend data stays
 * untouched.
 */
import { test, expect } from '../../fixtures'
import { runUITest } from '../../runner/runUITest'
import { applyLocaleCookie, ensureQuickPanelOpen, seedClientSelection } from '../../utils/ui'
import type { Page } from '@playwright/test'

interface UserConfigurationOverrides {
  read_only?: boolean
  server_write_access?: boolean
  terminal_forbidden?: boolean
  depot_access?: boolean
  host_group_access?: boolean
  product_group_access?: boolean
  client_creation?: boolean
}

/** Intercept /api/user/configuration and answer with a mocked permission set. */
async function mockUserConfiguration(page: Page, overrides: UserConfigurationOverrides): Promise<void> {
  await page.route('**/api/user/configuration*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: 'restricteduser',
        configuration: {
          read_only: false,
          server_write_access: true,
          terminal_forbidden: false,
          depot_access: false,
          host_group_access: false,
          product_group_access: false,
          client_creation: true,
          health: { counts: { ok: 1 }, worst_case: 'ok' },
          ...overrides,
        },
      }),
    })
  })
}

/** Intercept disabled-features endpoint used by dashboard/terminal permission badges. */
async function mockDisabledFeatures(page: Page, features: string[] = []): Promise<void> {
  await page.route('**/opsidata/server/disabled-features*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(features),
    })
  })
}

test.describe('User permissions', () => {
  for (const collapsed of [false, true]) {
    test(`terminal role keeps navigation disabled with ${collapsed ? 'collapsed' : 'expanded'} sidebar`, async ({ page }) => {
      await mockUserConfiguration(page, { terminal_forbidden: true })
      await mockDisabledFeatures(page)
      await page.addInitScript((menuCollapsed) => {
        localStorage.setItem('opsi-webgui-ui', JSON.stringify({ menuCollapsed, quickpanelOpened: false }))
      }, collapsed)
      await page.goto('/clients/', { waitUntil: 'domcontentloaded' })

      if (collapsed) {
        await page.locator('aside a[title][href*="/admin/"]').hover()
      } else {
        await page.locator('aside').getByRole('button', { name: /admin/i }).click()
      }

      const terminal = page.getByTestId('nav-admin-terminal')
      await expect(terminal).toBeVisible()
      await expect(terminal).toBeDisabled()
      await expect(terminal).not.toHaveAttribute('href')
      await terminal.scrollIntoViewIfNeeded()
      await page.keyboard.press('Tab')
      await page.getByTestId('nav-admin-diagnostics').focus()
      await page.keyboard.press('Shift+Tab')
      await expect(terminal).toBeFocused()
      await expect(page.locator('[data-testid="nav-admin-terminal"]:focus-visible')).toBeVisible()
      await expect(page.getByRole('tooltip')).toContainText(/permission|zugriff|accès/i)
      await terminal.press('Enter')
      await terminal.press('Space')
      expect(new URL(page.url()).pathname).toMatch(/\/clients\/?$/)
      await terminal.dispatchEvent('click')
      expect(new URL(page.url()).pathname).toMatch(/\/clients\/?$/)

      await page.goto('/admin/terminal', { waitUntil: 'domcontentloaded' })
      await expect(page).toHaveURL(/\/clients\/?$/)
      await expect(page.getByRole('button', { name: /^(connect|verbinden|connecter)$/i })).toHaveCount(0)
    })
  }

  for (const restriction of ['read_only', 'client_creation'] as const) {
    test(`clients clone panel denies writes with ${restriction} restriction`, async ({ page }) => {
      const [clientId] = await seedClientSelection(page)
      expect(clientId).toBeTruthy()
      await mockUserConfiguration(page, { [restriction]: restriction === 'read_only' })
      const writes: string[] = []
      await page.route('**/opsidata/clients/*/clone', async (route) => {
        writes.push(route.request().url())
        await route.fulfill({ status: 403, json: { message: 'Permission denied' } })
      })
      await page.goto(`/clients?client=${encodeURIComponent(clientId)}&view=panel&panelType=clone`, { waitUntil: 'domcontentloaded' })
      const panel = page.getByTestId('detail-panel')
      await expect(panel).toContainText(clientId)
      await expect(panel).toContainText(/permission denied|zugriff verweigert|accès refusé/i)
      await expect(panel.getByRole('textbox')).toHaveCount(0)
      await page.keyboard.press('Control+Enter')
      await expect(panel).toContainText(/permission denied|zugriff verweigert|accès refusé/i)
      expect(writes).toHaveLength(0)
    })
  }

  test('read-only user sees banner and disabled write actions on clients page', async ({ page }) => {
    await mockUserConfiguration(page, { read_only: true, client_creation: false })

    await runUITest(page, {
      name: 'permissions-readonly-clients',
      route: '/clients',
      waitAfterNav: 2000,
      functional: async (p) => {
        // Read-only banner in the layout header
        await expect(p.getByText(/Nur-Lese-Modus|Read-only mode/).first()).toBeVisible({
          timeout: 15000,
        })
        // "New client" button must be disabled (readOnly + no clientCreation)
        const newButton = p.locator('main button[aria-label="Neu"], main button[aria-label="New"]')
        if ((await newButton.count()) > 0) {
          await expect(newButton.first()).toBeDisabled()
        }
      },
    })
  })

  test('read-only user cannot open restricted pages (middleware redirect)', async ({ page }) => {
    await mockUserConfiguration(page, { read_only: true, client_creation: false })

    // Login via an accessible page first so the mocked configuration is loaded.
    await page.goto('/clients', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText(/Nur-Lese-Modus|Read-only mode/).first()).toBeVisible({ timeout: 15000 })

    // /admin/maintenance is blocked for read-only users -> redirected to /clients.
    // A full SPA boot (init plugin + config fetch) can take a while in dev mode,
    // so wait for the redirect instead of asserting immediately.
    await page.goto('/admin/maintenance', { waitUntil: 'domcontentloaded' })
    await page.waitForURL((url) => !url.pathname.includes('/admin/maintenance'), {
      timeout: 30000,
    })
    expect(page.url()).not.toContain('/admin/maintenance')

    await page.goto('/clients?view=panel&panelType=add', { waitUntil: 'domcontentloaded' })
    const panel = page.getByTestId('detail-panel')
    await expect(panel).toBeVisible()
    await expect(panel.getByRole('textbox')).toHaveCount(0)
    await expect(panel).toContainText(/permission|berechtigung|autorisation/i)
  })

  test('client creation disabled blocks the add panel form', async ({ page }) => {
    await mockUserConfiguration(page, { client_creation: false })
    await page.goto('/clients?view=panel&panelType=add', { waitUntil: 'domcontentloaded' })
    const panel = page.getByTestId('detail-panel')
    await expect(panel).toBeVisible()
    await expect(panel.getByRole('textbox')).toHaveCount(0)
    await expect(panel).toContainText(/permission|berechtigung|autorisation/i)
    await expect(page.locator('main').getByRole('button', { name: /^(new|neu|nouveau)$/i })).toBeDisabled()
  })

  test('depot/group-restricted user sees restriction badges in quickpanel', async ({ page }) => {
    await mockUserConfiguration(page, {
      depot_access: true,
      host_group_access: true,
      product_group_access: true,
    })

    await runUITest(page, {
      name: 'permissions-restricted-quickpanel',
      route: '/clients',
      waitAfterNav: 2000,
      functional: async (p) => {
        // Open the quickpanel if it is not already open
        const quickpanel = p.locator('[data-testid="quickpanel"]')
        await ensureQuickPanelOpen(p)
        await quickpanel.waitFor({ state: 'visible', timeout: 10000 })

        // Servers tab shows the "restricted" badge for depot-restricted users
        const serversTab = quickpanel
          .locator('button, [role="tab"]')
          .filter({ hasText: /Server/i })
          .first()
        await serversTab.click()
        await p.waitForTimeout(1000)
        await expect(quickpanel.getByText(/eingeschränkt|restricted/i).first()).toBeVisible({
          timeout: 10000,
        })
      },
    })
  })

  for (const { target, serverWrite, readOnly } of [
    { target: 'global', serverWrite: false, readOnly: false },
    { target: 'server', serverWrite: false, readOnly: false },
    { target: 'depot', serverWrite: false, readOnly: false },
    { target: 'global', serverWrite: true, readOnly: false },
    { target: 'global', serverWrite: true, readOnly: true },
    { target: 'client', serverWrite: false, readOnly: false },
    { target: 'client', serverWrite: true, readOnly: true },
  ]) {
    test(`configuration inputs for ${target} with server-write=${serverWrite} and read-only=${readOnly}`, async ({ page }) => {
      await mockUserConfiguration(page, { server_write_access: serverWrite, read_only: readOnly })
      await applyLocaleCookie(page, 'en')
      const readonly = readOnly || (target !== 'client' && !serverWrite)
      const global = target === 'global'
      const hostId = 'permission-test.opsi.test'
      if (target === 'client') {
        await page.route(
          (url) => url.pathname.endsWith('/opsidata/clients'),
          async (route) => {
            await route.fulfill({
              json: [
                { clientId: hostId, description: '', macAddress: '', ipAddress: '', lastSeen: '', depotId: '', notes: '', uefi: false },
              ],
            })
          },
        )
      } else if (!global) {
        await page.route(
          (url) => url.pathname.endsWith('/opsidata/depots'),
          async (route) => {
            await route.fulfill({
              json: [{ depotId: hostId, type: target === 'depot' ? 'OpsiDepotserver' : 'OpsiConfigserver', description: '' }],
            })
          },
        )
      }

      const prefix = global ? 'user.{restricteduser}' : 'clientconfig.permission-test'
      const ids = {
        bool: `${prefix}.${global ? 'privilege.host.opsiserver.write' : 'enabled'}`,
        text: `${prefix}.${global ? 'role' : 'label'}`,
        list: `${prefix}.${global ? 'connect.terminal.forbidden' : 'values'}`,
      }
      const configs = [
        { configId: ids.bool, type: 'BoolConfig', value: false, possibleValues: [false, true], multiValue: false, editable: false },
        { configId: ids.text, type: 'UnicodeConfig', value: 'operator', possibleValues: [], multiValue: false, editable: true },
        {
          configId: ids.list,
          type: 'UnicodeConfig',
          value: ['ConfigServer'],
          possibleValues: ['Clients', 'ConfigServer'],
          multiValue: true,
          editable: false,
        },
      ].map((config) => ({ ...config, objects: { [hostId]: config.value } }))
      await page.route(
        (url) => url.pathname.endsWith('/opsidata/config') || url.pathname.includes('/opsidata/config/objects/'),
        async (route) => {
          await route.fulfill({ json: { [global ? 'user' : 'clientconfig']: configs } })
        },
      )
      const writes: string[] = []
      await page.route('**/opsidata/config/values**', async (route) => {
        writes.push(route.request().url())
        await route.fulfill({ status: 403, json: { message: 'Permission denied' } })
      })

      const hostQuery = global ? '' : `&${target === 'client' ? 'client' : 'server'}=${encodeURIComponent(hostId)}`
      await page.goto(`/${target === 'client' ? 'clients' : 'servers'}?view=panel&panelType=config&configType=parameters${hostQuery}`, {
        waitUntil: 'domcontentloaded',
      })
      const panel = page.getByTestId('detail-panel')
      await expect(panel.locator('.params-tree').first()).toBeVisible()
      await panel.locator('input').first().fill(prefix)
      if (global) await panel.getByRole('button', { name: /^connect\b/ }).click()
      const row = (id: string) =>
        panel
          .locator('.param-tree-node')
          .filter({ has: page.locator(`span[title="${id}"]`) })
          .last()
      const text = row(ids.text).getByRole('textbox')
      const checkbox = row(ids.bool).getByRole('checkbox')
      const list = row(ids.list).getByRole('button', { name: 'Value', exact: true })
      const unsaved = panel.getByRole('button', { name: /unsaved changes/i })
      await expect(text).toHaveValue('operator')
      await expect(checkbox).not.toBeChecked()
      await expect(list).toContainText('ConfigServer')

      if (readonly) {
        await expect(text).toBeDisabled()
        await expect(checkbox).toBeDisabled()
        await expect(list).toBeDisabled()
        await page.keyboard.press('Control+Enter')
        await expect(unsaved).toHaveCount(0)
      } else {
        await expect(text).toBeEnabled()
        await expect(checkbox).toBeEnabled()
        await expect(list).toBeEnabled()
        await text.fill('updated operator')
        await checkbox.check()
        await expect(unsaved).toBeVisible()
      }
      expect(writes).toHaveLength(0)
    })
  }

  test('dashboard shows permission restrictions for restricted users (visual regression)', async ({ page }) => {
    await mockUserConfiguration(page, {
      read_only: true,
      server_write_access: false,
      depot_access: true,
      host_group_access: true,
      product_group_access: true,
      client_creation: false,
    })
    await mockDisabledFeatures(page, ['terminal', 'messagebus_terminal'])

    await runUITest(page, {
      name: 'permissions-dashboard-restricted',
      route: '/dashboard',
      waitAfterNav: 3000,
      functional: async (p) => {
        await expect(p.getByText(/restricted|eingeschränkt/i).first()).toBeVisible({
          timeout: 15000,
        })
        await expect(p.getByText(/Read Only|Nur-Lese-Zugriff|Accès en lecture seule/i).first()).toBeVisible({ timeout: 15000 })
        await expect(p.getByText('Terminal').first()).toBeVisible({ timeout: 15000 })
      },
    })
  })

  test('restricted user sees restriction badges on data pages (visual regression)', async ({ page }) => {
    await mockUserConfiguration(page, {
      depot_access: true,
      host_group_access: true,
      product_group_access: true,
    })

    // Clients page: host-group restriction badge
    await runUITest(page, {
      name: 'permissions-restricted-clients-badge',
      route: '/clients',
      waitAfterNav: 2500,
      functional: async (p) => {
        await expect(p.getByTestId('clients-restricted-badge')).toBeVisible({ timeout: 15000 })
      },
    })

    // Products page: product-group restriction badge
    await runUITest(page, {
      name: 'permissions-restricted-products-badge',
      route: '/products',
      waitAfterNav: 2500,
      functional: async (p) => {
        await expect(p.getByTestId('products-restricted-badge')).toBeVisible({ timeout: 15000 })
      },
    })

    // Servers page: depot-access restriction badge
    await runUITest(page, {
      name: 'permissions-restricted-servers-badge',
      route: '/servers',
      waitAfterNav: 2500,
      functional: async (p) => {
        await expect(p.getByTestId('servers-restricted-badge')).toBeVisible({ timeout: 15000 })
      },
    })
  })
})
