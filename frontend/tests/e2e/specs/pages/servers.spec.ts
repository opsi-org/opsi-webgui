/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 */

import { test, expect } from '../../fixtures'
import type { Page } from '@playwright/test'
import { runUITest } from '../../runner/runUITest'
import { ensureQuickPanelOpen, waitForTable, getTableRowCount } from '../../utils/ui'
import en from '../../../../i18n/locales/opsi-webgui_en.json' with { type: 'json' }
import de from '../../../../i18n/locales/opsi-webgui_de.json' with { type: 'json' }
import fr from '../../../../i18n/locales/opsi-webgui_fr.json' with { type: 'json' }

test.describe('Servers', () => {
  for (const [locale, messages] of Object.entries({ en, de, fr })) {
    test(`servers navigation translates all labels in ${locale}`, async ({ page, baseURL }) => {
      await page.context().addCookies([{ name: 'opsi-webgui-user-locale', value: locale, url: baseURL! }])
      await page.goto('/servers', { waitUntil: 'networkidle' })
      const servers = page.getByTestId('nav-servers')
      if (!(await servers.textContent())?.trim()) {
        await page.getByRole('button', { name: /toggle sidebar|seitenleiste|barre latérale/i }).click()
      }
      for (const section of ['dashboard', 'servers', 'clients', 'products', 'groups', 'support'] as const) {
        await expect(page.getByTestId(`nav-${section}`)).toHaveText(messages[section].title)
      }
      const admin = page.locator('nav').getByRole('button', { name: messages.nav.admin, exact: true })
      await expect(admin).toBeVisible()
      if (!(await page.getByTestId('nav-admin-terminal').isVisible())) await admin.click()
      await expect(page.getByTestId('nav-admin-terminal')).toHaveText(messages.terminal.title)
      await expect(page.getByTestId('nav-admin-diagnostics')).toHaveText(messages.diag.title)
      await expect(page.getByTestId('nav-admin-maintenance')).toHaveText(messages.admin.maintenance)
      await page.getByRole('button', { name: messages.nav.sidebar }).click()
      await expect(servers).toHaveAttribute('title', messages.servers.title)
    })
  }

  test('servers navigation opens the list directly without a submenu', async ({ page }) => {
    await page.goto('/products', { waitUntil: 'networkidle' })
    const servers = page.getByTestId('nav-servers')
    await expect(servers).toHaveAttribute('href', /\/servers$/)
    await expect(page.locator('nav').getByRole('button', { name: /^(servers|serveurs)$/i })).toHaveCount(0)
    await expect(page.getByTestId('nav-servers-configuration-parameters')).toHaveCount(0)
    await servers.click()
    await expect(page).toHaveURL(/\/servers$/)
    await expect(page.locator('table')).toBeVisible()
    await page.getByRole('button', { name: /toggle sidebar|seitenleiste|barre latérale/i }).click()
    await expect(servers).toHaveAttribute('href', /\/servers$/)
  })

  test('servers configuration deep link preserves table context and browser history', async ({ page }) => {
    await page.goto('/servers', { waitUntil: 'networkidle' })
    await waitForTable(page)
    const serverId = await page.locator('tr[id^="servers-row-"]').first().getAttribute('id')
    expect(serverId).toBeTruthy()
    const id = serverId!.replace('servers-row-', '')
    const filter = 'server-panel-no-matching-row'
    await page.goto(`/servers?filter=${filter}`, { waitUntil: 'networkidle' })
    const context = () =>
      page.evaluate(() => ({
        selection: localStorage.getItem('opsi-webgui-selection'),
        filters: localStorage.getItem('opsi-webgui-datatable-filter-queries'),
        settings: localStorage.getItem('opsi-webgui-datatable-settings'),
      }))
    const before = await context()
    await navigateServerPanel(page, id, 'parameter')
    const panel = page.getByTestId('detail-panel')
    await expect(panel).toBeVisible()
    await expect(panel).toContainText(id)
    await expect(panel.getByRole('button', { name: /select server|server auswählen|sélectionner un serveur/i })).toHaveCount(0)
    await expect(page).toHaveURL(new RegExp(`filter=${filter}`))
    expect(await context()).toEqual(before)
    await page.goBack()
    await expect(panel).toBeHidden()
    await page.goForward()
    await expect(panel).toBeVisible()
    await page.reload({ waitUntil: 'networkidle' })
    await expect(panel).toBeVisible()
    expect(await context()).toEqual(before)
    await panel.getByRole('button', { name: /^(close|schließen|fermer|back|zurück|retour)$/i }).click()
    await expect(panel).toBeHidden()
    await expect(page).toHaveURL(new RegExp(`filter=${filter}`))
    await page.goto(`/servers?filter=${filter}&view=panel&server=missing-server.invalid`, { waitUntil: 'networkidle' })
    await expect(panel).toBeHidden()
    expect(await context()).toEqual(before)
  })

  test('servers configuration defaults remain available in a panel', async ({ page }) => {
    await page.goto('/servers?filter=', { waitUntil: 'networkidle' })
    await waitForTable(page)
    const selection = await page.evaluate(() => localStorage.getItem('opsi-webgui-selection'))
    expect(JSON.parse(selection || '{}').selectedServers.length).toBeGreaterThan(0)
    await page.getByTestId('servers-open-global-parameters-panel').click()
    const panel = page.getByTestId('detail-panel')
    await expect(panel).toBeVisible()
    await expect(panel).toContainText(/global parameters|globale parameter|paramètres globaux/i)
    await expect(page.locator('table')).toBeVisible()
    await expect(panel.getByRole('tab', { name: /default|standard|défaut/i })).toBeVisible()
    await expect(panel.getByRole('tab', { name: /attributes|attribute|attributs/i })).toHaveCount(0)
    const createConfiguration = /create configuration|konfiguration erstellen|créer.*configuration/i
    await expect(panel.getByRole('button', { name: createConfiguration })).toHaveCount(0)
    await expect(page.getByRole('button', { name: createConfiguration })).toBeVisible()
    await expect(page).not.toHaveURL(/[?&]server=/)
    expect(await page.evaluate(() => localStorage.getItem('opsi-webgui-selection'))).toBe(selection)
    await page.reload({ waitUntil: 'networkidle' })
    await expect(panel.getByRole('tab', { name: /default|standard|défaut/i })).toBeVisible()
    await expect(panel.getByRole('tab', { name: /attributes|attribute|attributs/i })).toHaveCount(0)
    expect(await page.evaluate(() => localStorage.getItem('opsi-webgui-selection'))).toBe(selection)
    await panel.evaluate((element) => element.setAttribute('data-panel-continuity', 'global-parameters'))
    const serverId = JSON.parse(selection || '{}').selectedServers.at(-1)
    let releaseLookup: (() => void) | null = null
    await page.route('**/opsidata/depots?**', async (route) => {
      const filter = new URL(route.request().url()).searchParams.get('filterQuery')
      if (filter !== JSON.stringify({ id: [serverId] })) return route.continue()
      const response = await route.fetch()
      await new Promise<void>((resolve) => {
        releaseLookup = resolve
      })
      await route.fulfill({ response })
    })
    await navigateServerPanel(page, serverId)
    await expect.poll(() => releaseLookup !== null).toBe(true)
    await expect(panel).toBeVisible()
    await expect(panel).toHaveAttribute('data-panel-continuity', 'global-parameters')
    releaseLookup!()
    await expect(panel.getByRole('tab', { name: /attributes|attribute|attributs/i })).toBeVisible()
    await expect(panel).toHaveAttribute('data-panel-continuity', 'global-parameters')
    await page.getByTestId('servers-open-global-parameters-panel').click()
    await expect(panel.getByRole('tab', { name: /default|standard|défaut/i })).toBeVisible()
    await expect(panel.getByRole('tab', { name: /attributes|attribute|attributs/i })).toHaveCount(0)
    await expect(panel).toHaveAttribute('data-panel-continuity', 'global-parameters')
    expect(await page.evaluate(() => localStorage.getItem('opsi-webgui-selection'))).toBe(selection)
  })

  async function navigateServerPanel(page: Page, server?: string, configType = 'attributes') {
    await page.evaluate(
      async ({ server, configType }) => {
        const root = document.querySelector('#__nuxt') as Element & {
          __vue_app__: { config: { globalProperties: { $router: { push: (to: unknown) => Promise<unknown> } } } }
        }
        await root.__vue_app__.config.globalProperties.$router.push({
          path: '/servers',
          query: server === undefined ? {} : { server, view: 'panel', configType },
        })
      },
      { server, configType },
    )
  }

  test('servers configuration protects edits and supports save and discard', async ({ page }) => {
    await page.goto('/servers', { waitUntil: 'networkidle' })
    await waitForTable(page)
    const rowId = await page.locator('tr[id^="servers-row-"]').first().getAttribute('id')
    const id = rowId!.replace('servers-row-', '')
    const writes: unknown[] = []
    await page
      .locator(`tr[id="servers-row-${id}"]`)
      .getByRole('button', { name: /configuration|konfiguration/i })
      .click()
    await expect(page).toHaveURL(/\/servers\?/)
    await expect(page.getByTestId('detail-panel')).toBeVisible()
    await page.route('**/opsidata/servers?**', async (route) => {
      await route.fulfill({ json: [{ id, description: 'Original description' }] })
    })
    await page.route(`**/opsidata/servers/${id}`, async (route) => {
      if (route.request().method() !== 'PUT') return route.continue()
      writes.push(route.request().postDataJSON())
      await route.fulfill({ json: {} })
    })
    await navigateServerPanel(page)
    await page
      .locator(`tr[id="servers-row-${id}"]`)
      .getByRole('button', { name: /configuration|konfiguration/i })
      .click()
    const panel = page.getByTestId('detail-panel')
    const description = panel.getByRole('textbox', { name: /description|beschreibung/i, exact: true })
    await expect(description).toHaveValue('Original description')
    await description.fill('Changed description')
    const close = panel.getByRole('button', { name: /^(close|schließen|fermer|back|zurück|retour)$/i })
    const dialog = page.getByRole('dialog')
    const stay = dialog.getByRole('button', { name: /stay on page|auf.*seite bleiben|rester sur/i })
    const leave = dialog.getByRole('button', { name: /leave anyway|trotzdem verlassen|quitter quand/i })
    await close.click()
    await expect(dialog).toBeVisible()
    await stay.click()
    const switching = navigateServerPanel(page, 'other-server.invalid')
    await expect(dialog).toBeVisible()
    await stay.click()
    await switching
    await expect(description).toHaveValue('Changed description')
    const closing = navigateServerPanel(page)
    await expect(dialog).toBeVisible()
    await stay.click()
    await closing
    await page.getByTestId('nav-products').click()
    await expect(dialog).toBeVisible()
    await stay.click()
    await expect(description).toHaveValue('Changed description')
    await panel.getByRole('button', { name: /unsaved changes|ungespeicherte änderungen|modifications non enregistrées/i }).click()
    await dialog.getByRole('button', { name: /save all|alles speichern|tout enregistrer/i }).click()
    await expect.poll(() => writes).toEqual([{ hostId: id, description: 'Changed description' }])
    await page.keyboard.press('Escape')
    await description.fill('Discarded description')
    await close.click()
    await leave.click()
    await expect(panel).toBeHidden()
    await navigateServerPanel(page, id)
    await expect(description).toHaveValue('Original description')
  })

  test('servers configuration ignores delayed targets after closing', async ({ page }) => {
    await page.goto('/servers', { waitUntil: 'networkidle' })
    await waitForTable(page)
    const rowId = await page.locator('tr[id^="servers-row-"]').first().getAttribute('id')
    const id = rowId!.replace('servers-row-', '')
    let releaseLookup: (() => void) | null = null
    await page.route('**/opsidata/depots?**', async (route) => {
      const filter = new URL(route.request().url()).searchParams.get('filterQuery')
      if (filter !== JSON.stringify({ id: [id] })) return route.continue()
      const response = await route.fetch()
      await new Promise<void>((resolve) => {
        releaseLookup = resolve
      })
      await route.fulfill({ response })
    })
    await navigateServerPanel(page, id)
    await expect.poll(() => releaseLookup !== null).toBe(true)
    await navigateServerPanel(page)
    releaseLookup!()
    await page.waitForLoadState('networkidle')
    await expect(page.getByTestId('detail-panel')).toBeHidden()
  })

  test('servers overview with quickpanel', async ({ page }) => {
    await runUITest(page, {
      name: 'servers',
      route: '/servers',
      waitAfterNav: 3000,
      docName: 'opsi-webgui-servers-overview',
      functional: async (p) => {
        await waitForTable(p)
        const count = await getTableRowCount(p)
        expect(count).toBeGreaterThan(0)

        // Select first server row so it shows in quickpanel overview
        const firstRow = p.locator('table tbody tr').first()
        if (await firstRow.isVisible().catch(() => false)) {
          await firstRow.click()
          await p.waitForTimeout(500)
        }

        await ensureQuickPanelOpen(p)
      },
    })
  })

  test('servers configuration', async ({ page }) => {
    await runUITest(page, {
      name: 'servers-config',
      route: '/servers?view=panel&configType=parameters',
      waitAfterNav: 3000,
      docName: 'opsi-webgui-servers-configuration',
      functional: async (p) => {
        // Config tabs should be present and switchable
        const tabs = p.getByRole('tab')
        if (
          await tabs
            .first()
            .isVisible()
            .catch(() => false)
        ) {
          const tabCount = await tabs.count()
          expect(tabCount).toBeGreaterThan(0)

          // Click second tab if available
          if (tabCount > 1) {
            await tabs.nth(1).click()
            await p.waitForTimeout(1000)
          }
        }
      },
      elementShots: [
        {
          name: 'opsi-webgui-server-create-configuration-button',
          captureSelector:
            'button:has-text("Neu"), button:has-text("New"), button:has-text("Hinzufügen"), button:has-text("Add"), button:has-text("Create")',
        },
        // New-config / add-config dialog
        {
          name: 'opsi-webgui-servers-new-config-dialog',
          captureSelector: '[role="dialog"]',
          before: async (p) => {
            const addBtn = p
              .locator(
                'button:has-text("Neu"), button:has-text("New"), button:has-text("Hinzufügen"), ' +
                  'button:has-text("Add"), button:has-text("Create"), ' +
                  '[aria-label*="add" i], [aria-label*="create" i], [aria-label*="neu" i]',
              )
              .first()
            if (await addBtn.isVisible().catch(() => false)) {
              await addBtn.click()
              await p.waitForTimeout(800)
            }
          },
          after: async (p) => {
            await p.keyboard.press('Escape')
            await p.waitForTimeout(200)
          },
        },
      ],
    })
  })
})
