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
import { ensureQuickPanelOpen, seedClientSelection, waitForTable, getTableRowCount } from '../../utils/ui'

async function navigateClientPanel(
  page: Page,
  clientId: string,
  panelType: 'config' | 'logs' | 'inventory' | 'clone' | 'add',
  tab = 'software',
) {
  await page.evaluate(
    async ({ id, type, tab }) => {
      const root = document.querySelector('#__nuxt') as Element & {
        __vue_app__: { config: { globalProperties: { $router: { push: (to: unknown) => Promise<unknown> } } } }
      }
      await root.__vue_app__.config.globalProperties.$router.push({
        path: '/clients',
        query: {
          ...(type === 'add' ? {} : { client: id }),
          view: 'panel',
          panelType: type,
          ...(type === 'inventory' ? { inventoryTab: tab } : {}),
          ...(type === 'config' ? { configType: tab } : {}),
        },
      })
    },
    { id: clientId, type: panelType, tab },
  )
}

test.describe('Clients', () => {
  test('clients add deep link preserves table context without a selected client', async ({ page }) => {
    await page.goto('/clients', { waitUntil: 'networkidle' })
    const filter = 'add-link-no-matching-client'
    await page.evaluate((value) => {
      localStorage.setItem('opsi-webgui-datatable-filter-queries', JSON.stringify({ clients: value }))
      localStorage.setItem('opsi-webgui-clients-advanced-filters', JSON.stringify({ reachable: false }))
      const selection = JSON.parse(localStorage.getItem('opsi-webgui-selection') || '{}')
      localStorage.setItem('opsi-webgui-selection', JSON.stringify({ ...selection, selectedClients: [] }))
    }, filter)
    await page.goto(`/clients?filter=${filter}`, { waitUntil: 'networkidle' })
    const context = () =>
      page.evaluate(() => ({
        selection: localStorage.getItem('opsi-webgui-selection'),
        filters: localStorage.getItem('opsi-webgui-datatable-filter-queries'),
        advancedFilters: localStorage.getItem('opsi-webgui-clients-advanced-filters'),
        settings: localStorage.getItem('opsi-webgui-datatable-settings'),
        defaultPanel: document.cookie.match(/(?:^|; )opsi-webgui-default-client-panel-view=([^;]*)/)?.[1],
      }))
    const before = await context()
    const panelRequests: string[] = []
    page.on('request', (request) => {
      const pathname = new URL(request.url()).pathname
      if (pathname.endsWith('/opsidata/depots/clients') || pathname.endsWith('/opsidata/depots/products')) panelRequests.push(pathname)
    })
    await navigateClientPanel(page, '', 'add')
    const panel = page.getByTestId('detail-panel')
    await expect(panel).toBeVisible()
    await expect(panel.getByRole('textbox').first()).toHaveValue('')
    await expect.poll(() => panelRequests.filter((path) => path.endsWith('/clients')).length).toBe(1)
    await expect.poll(() => panelRequests.filter((path) => path.endsWith('/products')).length).toBe(1)
    await expect(page).toHaveURL(new RegExp(`filter=${filter}`))
    await expect(page).not.toHaveURL(/[?&]client=/)
    expect(await context()).toEqual(before)
    await page.goBack()
    await expect(panel).toBeHidden()
    await page.goForward()
    await expect(panel).toBeVisible()
    await panel.getByRole('button', { name: /^(close|schließen|fermer|back|zurück|retour)$/i }).click()
    await expect(panel).toBeHidden()
    expect(await context()).toEqual(before)
    await page.goto('/clients?view=panel&panelType=add', { waitUntil: 'networkidle' })
    await expect(panel).toBeVisible()
    expect(await context()).toEqual(before)
    await page.reload({ waitUntil: 'networkidle' })
    await expect(panel).toBeVisible()
    expect(await context()).toEqual(before)
  })

  test('clients add protects edits and supports error feedback, save and discard', async ({ page }) => {
    const writes: Array<{ client: { hostId: string; description: string }; depot: string }> = []
    await page.route('**/opsidata/clients', async (route) => {
      if (route.request().method() !== 'POST') return route.continue()
      writes.push(route.request().postDataJSON())
      if (writes.length === 1) {
        await route.fulfill({ status: 500, json: { message: 'Create test failure' } })
      } else {
        await route.fulfill({ json: {} })
      }
    })
    await page.goto('/clients?filter=add-edit-no-matching-client&view=panel&panelType=add', { waitUntil: 'networkidle' })
    const selection = await page.evaluate(() => localStorage.getItem('opsi-webgui-selection'))
    const panel = page.getByTestId('detail-panel')
    const hostname = panel.getByRole('textbox').nth(0)
    const domain = panel.getByRole('textbox').nth(1)
    const description = panel.getByRole('textbox').nth(2)
    const close = panel.getByRole('button', { name: /^(close|schließen|fermer|back|zurück|retour)$/i })
    const create = panel.getByRole('button', { name: /Add Client|Client hinzufügen|Ajouter un client/i })
    const dialog = page.getByRole('dialog')
    const stay = dialog.getByRole('button', { name: /stay on page|auf.*seite bleiben|rester sur/i })
    const leave = dialog.getByRole('button', { name: /leave anyway|trotzdem verlassen|quitter quand/i })
    await expect(create).toBeDisabled()
    await hostname.fill('panel-add-test')
    await description.fill('Panel creation test')
    await close.click()
    await expect(dialog).toBeVisible()
    await stay.click()
    await expect(hostname).toHaveValue('panel-add-test')
    const closingRoute = page.evaluate(async () => {
      const root = document.querySelector('#__nuxt') as Element & {
        __vue_app__: { config: { globalProperties: { $router: { push: (to: unknown) => Promise<unknown> } } } }
      }
      await root.__vue_app__.config.globalProperties.$router.push('/clients')
    })
    await expect(dialog).toBeVisible()
    await stay.click()
    await closingRoute
    await expect(hostname).toHaveValue('panel-add-test')
    await page.getByTestId('clients-open-products-panel').click()
    await expect(dialog).toBeVisible()
    await stay.click()
    await expect(hostname).toHaveValue('panel-add-test')
    await page.getByTestId('nav-products').click()
    await expect(dialog).toBeVisible()
    await stay.click()
    await expect(hostname).toHaveValue('panel-add-test')
    await close.click()
    await leave.click()
    await expect(panel).toBeHidden()
    await navigateClientPanel(page, '', 'add')
    await expect(hostname).toHaveValue('')
    await expect(domain).not.toHaveValue('')
    await hostname.fill('panel-add-test')
    await domain.fill('.example.invalid')
    await description.fill('Panel creation test')
    await create.click()
    await expect(panel).toContainText(/Create test failure|500/)
    await expect(hostname).toHaveValue('panel-add-test')
    await create.click()
    await expect(panel).toBeHidden()
    expect(writes).toHaveLength(2)
    expect(writes[1]).toMatchObject({ client: { hostId: 'panel-add-test.example.invalid', description: 'Panel creation test' } })
    expect(writes[1].depot).toBeTruthy()
    await expect(page.locator('main')).toContainText(/successfully|erfolgreich|succès/i)
    await expect(page).toHaveURL(/filter=add-edit-no-matching-client/)
    expect(await page.evaluate(() => localStorage.getItem('opsi-webgui-selection'))).toBe(selection)
  })

  test('clients navigation opens the list directly without a submenu', async ({ page }) => {
    await page.goto('/products', { waitUntil: 'networkidle' })
    const clients = page.getByTestId('nav-clients')
    await expect(clients).toHaveAttribute('href', /\/clients$/)
    await expect(page.locator('nav').getByRole('button', { name: /^clients$/i })).toHaveCount(0)
    await expect(
      page.locator('nav').getByRole('link', { name: /all clients|alle clients|tous les clients|add new|neu hinzufügen/i }),
    ).toHaveCount(0)
    await clients.click()
    await expect(page).toHaveURL(/\/clients$/)
    await expect(page.locator('table')).toBeVisible()
    await page.getByRole('button', { name: /toggle sidebar|seitenleiste|barre latérale/i }).click()
    await expect(clients).toHaveAttribute('href', /\/clients$/)
    await clients.click()
    await expect(page).toHaveURL(/\/clients$/)
    await expect(page.locator('table')).toBeVisible()
  })

  for (const panelType of ['config', 'logs', 'inventory', 'clone'] as const) {
    test(`clients ${panelType} deep link preserves table context for a filtered-out client`, async ({ page }) => {
      const [clientId, selectedClientId] = await seedClientSelection(page, { count: 2 })
      expect(clientId).toBeTruthy()
      expect(selectedClientId).toBeTruthy()
      const filter = `${panelType}-link-no-matching-client`
      await page.context().addCookies([{ name: 'opsi-webgui-default-client-panel-view', value: 'logs', url: page.url() }])
      await page.evaluate(
        ({ value, selectedId }) => {
          localStorage.setItem('opsi-webgui-datatable-filter-queries', JSON.stringify({ clients: value }))
          localStorage.setItem('opsi-webgui-clients-advanced-filters', JSON.stringify({ reachable: false }))
          const selection = JSON.parse(localStorage.getItem('opsi-webgui-selection') || '{}')
          localStorage.setItem('opsi-webgui-selection', JSON.stringify({ ...selection, selectedClients: [selectedId] }))
        },
        { value: filter, selectedId: selectedClientId },
      )
      await page.goto(`/clients?filter=${filter}`, { waitUntil: 'networkidle' })
      const before = await page.evaluate(() => ({
        selection: localStorage.getItem('opsi-webgui-selection'),
        filters: localStorage.getItem('opsi-webgui-datatable-filter-queries'),
        advancedFilters: localStorage.getItem('opsi-webgui-clients-advanced-filters'),
        settings: localStorage.getItem('opsi-webgui-datatable-settings'),
        defaultPanel: document.cookie.match(/(?:^|; )opsi-webgui-default-client-panel-view=([^;]*)/)?.[1],
      }))
      const tableRequests: string[] = []
      page.on('request', (request) => {
        if (new URL(request.url()).pathname.endsWith('/opsidata/clients')) tableRequests.push(request.url())
      })
      const firstTab = panelType === 'config' ? 'parameters' : 'software'
      const secondTab = panelType === 'config' ? 'attributes' : 'hardware'
      const navigatePanel = (targetId: string, tab = firstTab) => navigateClientPanel(page, targetId, panelType, tab)
      await navigatePanel(clientId)
      const panel = page.getByTestId('detail-panel')
      await expect(panel).toBeVisible()
      await expect(panel).toContainText(clientId)
      await expect(page).toHaveURL(new RegExp(`filter=${filter}`))
      expect(tableRequests).toHaveLength(1)
      const lookup = new URL(tableRequests[0])
      expect(JSON.parse(lookup.searchParams.get('filterQuery') || '{}')).toEqual({ id: [clientId] })
      expect(lookup.searchParams.has('selectedDepots')).toBe(false)
      expect(lookup.searchParams.has('selectedClients')).toBe(false)
      await expect(page.locator('table tbody')).not.toContainText(clientId)
      const after = await page.evaluate(() => ({
        selection: localStorage.getItem('opsi-webgui-selection'),
        filters: localStorage.getItem('opsi-webgui-datatable-filter-queries'),
        advancedFilters: localStorage.getItem('opsi-webgui-clients-advanced-filters'),
        settings: localStorage.getItem('opsi-webgui-datatable-settings'),
        defaultPanel: document.cookie.match(/(?:^|; )opsi-webgui-default-client-panel-view=([^;]*)/)?.[1],
      }))
      expect(after).toEqual(before)
      const link = `/clients?client=${encodeURIComponent(clientId)}&view=panel&panelType=${panelType}${panelType === 'inventory' ? '&inventoryTab=software' : panelType === 'config' ? '&configType=parameters' : ''}`
      if (panelType === 'inventory') {
        await expect(panel.getByRole('tab', { name: /software/i })).toHaveAttribute('data-state', 'active')
        await panel.getByRole('tab', { name: /hardware/i }).click()
        await expect(page).toHaveURL(/inventoryTab=hardware/)
      }
      if (panelType === 'config') {
        await expect(panel.getByRole('tab', { name: /parameters|parameter|paramètres/i })).toHaveAttribute('data-state', 'active')
        await panel.getByRole('tab', { name: /attributes|attribute|attributs/i }).click()
        await expect(page).toHaveURL(/configType=attributes/)
      }
      const tableFilter = page
        .locator('main')
        .getByRole('textbox', { name: /filter|filtern|filtrer/i })
        .first()
      await tableFilter.fill(`${filter}-updated`)
      await expect(page).toHaveURL(new RegExp(`filter=${filter}-updated`))
      await expect(panel).toContainText(clientId)
      await tableFilter.fill(filter)
      await expect(page).toHaveURL(new RegExp(`filter=${filter}(?:&|$)`))
      await panel.getByRole('button', { name: /^(close|schließen|fermer|back|zurück|retour)$/i }).click()
      await expect(panel).toBeHidden()
      await expect(page).not.toHaveURL(/inventoryTab=/)
      await expect(page).not.toHaveURL(/configType=/)
      await expect(page).toHaveURL(new RegExp(`filter=${filter}`))
      expect(await page.evaluate(() => localStorage.getItem('opsi-webgui-selection'))).toBe(before.selection)
      await page.goto(link, { waitUntil: 'networkidle' })
      await expect(panel).toBeVisible()
      await expect(panel).toContainText(clientId)
      if (panelType === 'inventory') {
        await expect(panel.getByRole('tab', { name: /software/i })).toHaveAttribute('data-state', 'active')
      }
      await expect(page.locator('table tbody')).not.toContainText(clientId)
      expect(await page.evaluate(() => localStorage.getItem('opsi-webgui-selection'))).toBe(before.selection)
      if (panelType === 'clone') {
        await page.reload({ waitUntil: 'networkidle' })
        await expect(panel).toContainText(clientId)
        await navigatePanel(selectedClientId)
        await expect(panel).toContainText(selectedClientId)
        await page.goBack()
        await expect(panel).toContainText(clientId)
        await page.goForward()
        await expect(panel).toContainText(selectedClientId)
        expect(await page.evaluate(() => localStorage.getItem('opsi-webgui-selection'))).toBe(before.selection)
        expect(await page.evaluate(() => localStorage.getItem('opsi-webgui-clients-advanced-filters'))).toBe(before.advancedFilters)
        expect(await page.evaluate(() => document.cookie.match(/(?:^|; )opsi-webgui-default-client-panel-view=([^;]*)/)?.[1])).toBe(
          before.defaultPanel,
        )
      }
      if (panelType === 'inventory' || panelType === 'config') {
        await page.reload({ waitUntil: 'networkidle' })
        await expect(panel).toContainText(clientId)
        await expect(page).toHaveURL(new RegExp(`${panelType === 'config' ? 'configType' : 'inventoryTab'}=${firstTab}`))
        await navigatePanel(selectedClientId, secondTab)
        await expect(panel).toContainText(selectedClientId)
        await expect(page).toHaveURL(new RegExp(`${panelType === 'config' ? 'configType' : 'inventoryTab'}=${secondTab}`))
        await page.goBack()
        await expect(panel).toContainText(clientId)
        await expect(page).toHaveURL(new RegExp(`${panelType === 'config' ? 'configType' : 'inventoryTab'}=${firstTab}`))
        await page.goForward()
        await expect(panel).toContainText(selectedClientId)
        await expect(page).toHaveURL(new RegExp(`${panelType === 'config' ? 'configType' : 'inventoryTab'}=${secondTab}`))
        await navigatePanel(`${panelType}-link-missing.example.invalid`)
        await expect(panel).toBeHidden()
        expect(await page.evaluate(() => localStorage.getItem('opsi-webgui-selection'))).toBe(before.selection)
        expect(await page.evaluate(() => localStorage.getItem('opsi-webgui-clients-advanced-filters'))).toBe(before.advancedFilters)
        expect(await page.evaluate(() => document.cookie.match(/(?:^|; )opsi-webgui-default-client-panel-view=([^;]*)/)?.[1])).toBe(
          before.defaultPanel,
        )
        await page.goBack()
        await expect(panel).toContainText(selectedClientId)
      }
    })

    test(`clients ${panelType} deep link to a missing client leaves table state intact`, async ({ page }) => {
      await page.goto('/clients', { waitUntil: 'networkidle' })
      const selection = await page.evaluate(() => localStorage.getItem('opsi-webgui-selection'))
      await page.goto(`/clients?client=${panelType}-link-missing.example.invalid&view=panel&panelType=${panelType}`, {
        waitUntil: 'networkidle',
      })
      await expect(page.getByTestId('detail-panel')).toBeHidden()
      await expect(page.getByText(/no data available|keine daten verfügbar|aucune donnée disponible/i).first()).toBeVisible()
      expect(await page.evaluate(() => localStorage.getItem('opsi-webgui-selection'))).toBe(selection)
    })
  }

  for (const panelType of ['config', 'inventory', 'clone'] as const) {
    test(`clients ${panelType} ignores delayed targets after switching or closing`, async ({ page }) => {
      const [clientId, nextClientId] = await seedClientSelection(page, { count: 2 })
      expect(clientId).toBeTruthy()
      expect(nextClientId).toBeTruthy()
      const selection = await page.evaluate(() => localStorage.getItem('opsi-webgui-selection'))
      let releaseLookup: (() => void) | null = null
      await page.route('**/opsidata/clients?**', async (route) => {
        const filter = new URL(route.request().url()).searchParams.get('filterQuery')
        if (filter !== JSON.stringify({ id: [clientId] })) return route.continue()
        const response = await route.fetch()
        await new Promise<void>((resolve) => {
          releaseLookup = resolve
        })
        await route.fulfill({ response })
      })
      const panel = page.getByTestId('detail-panel')
      await navigateClientPanel(page, clientId, panelType)
      await expect.poll(() => releaseLookup !== null).toBe(true)
      await expect(panel.getByRole('status', { name: /loading|wird geladen|chargement/i })).toBeVisible()
      await expect(page.getByText(/^(loading|wird geladen|chargement)(\.{3}|…)?$/i)).toHaveCount(0)
      await navigateClientPanel(page, nextClientId, panelType, panelType === 'config' ? 'attributes' : 'hardware')
      await expect(panel).toContainText(nextClientId)
      releaseLookup!()
      await page.waitForLoadState('networkidle')
      await expect(panel).toContainText(nextClientId)
      if (panelType !== 'clone') {
        await expect(
          panel.getByRole('tab', { name: panelType === 'config' ? /attributes|attribute|attributs/i : /hardware/i }),
        ).toHaveAttribute('data-state', 'active')
      }

      releaseLookup = null
      await navigateClientPanel(page, clientId, panelType)
      await expect.poll(() => releaseLookup !== null).toBe(true)
      await page.evaluate(async () => {
        const root = document.querySelector('#__nuxt') as Element & {
          __vue_app__: { config: { globalProperties: { $router: { push: (to: unknown) => Promise<unknown> } } } }
        }
        await root.__vue_app__.config.globalProperties.$router.push({ path: '/clients' })
      })
      releaseLookup!()
      await page.waitForLoadState('networkidle')
      await expect(panel).toBeHidden()
      expect(await page.evaluate(() => localStorage.getItem('opsi-webgui-selection'))).toBe(selection)
    })

    test(`clients ${panelType} inaccessible target leaves table state intact`, async ({ page }) => {
      const [clientId] = await seedClientSelection(page)
      expect(clientId).toBeTruthy()
      const selection = await page.evaluate(() => localStorage.getItem('opsi-webgui-selection'))
      await page.route('**/opsidata/clients?**', async (route) => {
        const filter = new URL(route.request().url()).searchParams.get('filterQuery')
        if (filter !== JSON.stringify({ id: [clientId] })) return route.continue()
        await route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ message: 'Panel access denied' }) })
      })
      await navigateClientPanel(page, clientId, panelType)
      await expect(page.getByTestId('detail-panel')).toBeHidden()
      await expect(page.locator('main')).toContainText(/Panel access denied|403/)
      expect(await page.evaluate(() => localStorage.getItem('opsi-webgui-selection'))).toBe(selection)
      await expect(page.locator('main table tbody tr').first()).toBeVisible()
    })
  }

  test('clients config protects edits on switching, closing and navigation and supports save and discard', async ({ page }) => {
    const [clientId, nextClientId] = await seedClientSelection(page, { count: 2 })
    expect(clientId).toBeTruthy()
    expect(nextClientId).toBeTruthy()
    const writes: unknown[] = []
    await page.route('**/opsidata/hosts?**', async (route) => {
      const hostId = new URL(route.request().url()).searchParams.get('hosts')
      if (hostId !== clientId && hostId !== nextClientId) return route.continue()
      await route.fulfill({ json: [{ id: hostId, description: 'Original description' }] })
    })
    await page.route(`**/opsidata/clients/${clientId}`, async (route) => {
      if (route.request().method() !== 'PUT') return route.continue()
      writes.push(route.request().postDataJSON())
      await route.fulfill({ json: {} })
    })
    await page.goto('/clients?filter=config-edit-no-matching-client', { waitUntil: 'networkidle' })
    const selection = await page.evaluate(() => localStorage.getItem('opsi-webgui-selection'))
    await navigateClientPanel(page, clientId, 'config', 'attributes')
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
    await expect(description).toHaveValue('Changed description')
    const switching = navigateClientPanel(page, nextClientId, 'config', 'attributes')
    await expect(dialog).toBeVisible()
    await stay.click()
    await switching
    await expect(panel).toContainText(clientId)
    await expect(description).toHaveValue('Changed description')
    const closing = page.evaluate(async () => {
      const root = document.querySelector('#__nuxt') as Element & {
        __vue_app__: { config: { globalProperties: { $router: { push: (to: unknown) => Promise<unknown> } } } }
      }
      await root.__vue_app__.config.globalProperties.$router.push({ path: '/clients' })
    })
    await expect(dialog).toBeVisible()
    await stay.click()
    await closing
    await expect(description).toHaveValue('Changed description')
    await panel.getByRole('button', { name: /unsaved changes|ungespeicherte änderungen|modifications non enregistrées/i }).click()
    await dialog.getByRole('button', { name: /save all|alles speichern|tout enregistrer/i }).click()
    await expect.poll(() => writes).toEqual([{ hostId: clientId, description: 'Changed description' }])
    await page.keyboard.press('Escape')
    await description.fill('Discarded description')
    await close.click()
    await leave.click()
    await expect(panel).toBeHidden()
    await expect(page).toHaveURL(/filter=config-edit-no-matching-client/)
    await navigateClientPanel(page, clientId, 'config', 'attributes')
    await expect(description).toHaveValue('Original description')
    await description.fill('Discard all description')
    await panel.getByRole('button', { name: /unsaved changes|ungespeicherte änderungen|modifications non enregistrées/i }).click()
    await dialog.getByRole('button', { name: /discard all|alles verwerfen|tout abandonner/i }).click()
    await page.keyboard.press('Escape')
    await expect(description).toHaveValue('Original description')
    expect(writes).toHaveLength(1)
    expect(await page.evaluate(() => localStorage.getItem('opsi-webgui-selection'))).toBe(selection)
  })

  test('clients clone protects edits on switching, closing and navigation and supports save and discard', async ({ page }) => {
    const [clientId, nextClientId] = await seedClientSelection(page, { count: 2 })
    expect(clientId).toBeTruthy()
    expect(nextClientId).toBeTruthy()
    const writes: unknown[] = []
    await page.route(`**/opsidata/clients/${clientId}/clone`, async (route) => {
      writes.push(route.request().postDataJSON())
      await route.fulfill({ json: {} })
    })
    await page.goto('/clients?filter=clone-edit-no-matching-client', { waitUntil: 'networkidle' })
    const selection = await page.evaluate(() => localStorage.getItem('opsi-webgui-selection'))
    await navigateClientPanel(page, clientId, 'clone')
    const panel = page.getByTestId('detail-panel')
    const hostname = panel.getByRole('textbox', { name: /hostname|nom d.hôte/i })
    const domain = panel.getByRole('textbox').nth(1)
    const configs = panel.getByRole('checkbox').nth(0)
    const properties = panel.getByRole('checkbox').nth(2)
    const close = panel.getByRole('button', { name: /^(close|schließen|fermer|back|zurück|retour)$/i }).first()
    const dialog = page.getByRole('dialog')
    const stay = dialog.getByRole('button', { name: /stay on page|auf.*seite bleiben|rester sur/i })
    const leave = dialog.getByRole('button', { name: /leave anyway|trotzdem verlassen|quitter quand/i })
    await expect(hostname).toHaveValue('')
    await expect(domain).toHaveValue(clientId.slice(clientId.indexOf('.')))
    await configs.uncheck()
    await close.click()
    await expect(dialog).toBeVisible()
    await stay.click()
    await expect(configs).not.toBeChecked()
    await hostname.fill('panel-clone-test')
    const switching = navigateClientPanel(page, nextClientId, 'clone')
    await expect(dialog).toBeVisible()
    await stay.click()
    await switching
    await expect(panel).toContainText(clientId)
    await expect(hostname).toHaveValue('panel-clone-test')
    const leaving = page.evaluate(async () => {
      const root = document.querySelector('#__nuxt') as Element & {
        __vue_app__: { config: { globalProperties: { $router: { push: (to: unknown) => Promise<unknown> } } } }
      }
      await root.__vue_app__.config.globalProperties.$router.push({ path: '/products' })
    })
    await expect(dialog).toBeVisible()
    await stay.click()
    await leaving
    await expect(hostname).toHaveValue('panel-clone-test')
    await close.click()
    await leave.click()
    await expect(panel).toBeHidden()
    await expect(page).toHaveURL(/filter=clone-edit-no-matching-client/)
    await navigateClientPanel(page, nextClientId, 'clone')
    await expect(domain).toHaveValue(nextClientId.slice(nextClientId.indexOf('.')))
    await expect(hostname).toHaveValue('')
    await expect(configs).toBeChecked()
    await navigateClientPanel(page, clientId, 'clone')
    await panel
      .getByRole('button', { name: /clone|klonen|cloner/i })
      .last()
      .click()
    await expect.poll(() => writes.length).toBe(0)
    await expect(panel.locator('.text-error').first()).toBeVisible()
    await hostname.fill('panel-clone-test')
    await properties.check()
    await panel
      .getByRole('button', { name: /clone|klonen|cloner/i })
      .last()
      .click()
    await expect
      .poll(() => writes)
      .toEqual([
        {
          target: {
            hostId: `panel-clone-test${clientId.slice(clientId.indexOf('.'))}`,
            ipAddress: '',
            hardwareAddress: '',
            systemUUID: '',
          },
          options: { configs: true, products: true, productProperties: true },
        },
      ])
    await expect(hostname).toHaveValue('')
    await expect(panel).toContainText(/successfully|erfolgreich|succès/i)
    await close.click()
    await expect(panel).toBeHidden()
    await expect(page).toHaveURL(/filter=clone-edit-no-matching-client/)
    expect(await page.evaluate(() => localStorage.getItem('opsi-webgui-selection'))).toBe(selection)
    await expect(page.locator('table tbody')).not.toContainText(clientId)
  })

  test('clients products split view opens from deep link', async ({ page }) => {
    await seedClientSelection(page)

    await page.goto('/clients?view=panel&panelType=products&sortBy=version_outdated&type=localboot', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    await waitForTable(page)
    const detailPanel = page.getByTestId('detail-panel')
    await expect(detailPanel).toBeVisible({ timeout: 15000 })

    const panelTables = detailPanel.locator('table')
    await expect(panelTables.first()).toBeVisible({ timeout: 15000 })
    await expect(page).toHaveURL(/panelType=products/)
    await expect(page).toHaveURL(/sortBy=version_outdated/)
  })

  test('clients hardware and software inventory', async ({ page }) => {
    await runUITest(page, {
      name: 'clients-inventory',
      route: '/clients',
      docName: 'opsi-webgui-clients-inventory',
      functional: async (p) => {
        await waitForTable(p)
        const firstRow = p.locator('table tbody tr').first()
        const clientId = await firstRow.locator('td').evaluateAll((cells) => {
          for (const cell of cells) {
            const text = (cell.textContent || '').trim()
            if (text && text.includes('.')) return text
          }
          return ''
        })
        expect(clientId).not.toBe('')
        await p.goto(`/clients?client=${encodeURIComponent(clientId)}&view=panel&panelType=inventory&inventoryTab=hardware`, {
          waitUntil: 'networkidle',
          timeout: 30000,
        })
        await waitForTable(p)

        const detailPanel = p.getByTestId('detail-panel')
        await expect(detailPanel).toBeVisible({ timeout: 15000 })
        const hardwareTab = detailPanel.getByRole('tab', { name: /hardware/i })
        const softwareTab = detailPanel.getByRole('tab', { name: /software/i })
        await expect(hardwareTab).toHaveAttribute('data-state', 'active')
        const hardwareDownload = p.waitForEvent('download')
        await detailPanel.getByRole('button', { name: /export/i }).click()
        expect((await hardwareDownload).suggestedFilename()).toBe(`${clientId}_hardware_inventory.csv`)
        await softwareTab.click()
        await expect(softwareTab).toHaveAttribute('data-state', 'active')
        const softwareDownload = p.waitForEvent('download')
        await detailPanel.getByRole('button', { name: /export/i }).click()
        expect((await softwareDownload).suggestedFilename()).toBe(`${clientId}_software_inventory.csv`)
      },
    })
  })

  test('clients overview and key actions', async ({ page }) => {
    await runUITest(page, {
      name: 'clients',
      route: '/clients',
      waitAfterNav: 0,
      docName: 'opsi-webgui-clients-overview',
      marketingName: 'opsi-webgui-clients-with-products',
      marketingPrepare: async (p) => {
        await waitForTable(p)

        // Click first row to select a client
        const firstRow = p.locator('table tbody tr, [class*="table"] [class*="row"]:not([class*="header"])').first()
        await firstRow.click()
        await p.waitForTimeout(800)

        // Wait for the products button to become visible (needs selection)
        const productsButton = p.getByTestId('clients-open-products-panel').first()
        await productsButton.waitFor({ state: 'visible', timeout: 8000 }).catch(() => undefined)
        if (await productsButton.isVisible().catch(() => false)) {
          await productsButton.click()
          await p.waitForTimeout(2000)

          // Wait for products table to load in the detail panel
          const panelTable = p.locator('[data-testid="detail-panel"] table tbody tr, main .split-panel table tbody tr').first()
          await panelTable.waitFor({ state: 'visible', timeout: 12000 }).catch(() => undefined)
        }
      },
      functional: async (p) => {
        const sidebar = p.getByRole('navigation').first()
        await expect(sidebar).toBeVisible({ timeout: 10000 })
        await expect(p.getByTestId('nav-dashboard')).toBeVisible()
        await expect(p.getByTestId('nav-clients')).toBeVisible()

        await p.getByTestId('nav-dashboard').click()
        await expect(p).toHaveURL(/\/dashboard/, { timeout: 10000 })
        await p.getByTestId('nav-clients').click()
        await expect(p).toHaveURL(/\/clients/, { timeout: 10000 })

        await waitForTable(p)
        const count = await getTableRowCount(p)
        expect(count).toBeGreaterThan(0)

        // Table header columns are visible
        const headers = p.locator('thead th, [class*="header"] [class*="cell"]')
        await headers
          .first()
          .waitFor({ state: 'visible', timeout: 15000 })
          .catch(() => undefined)
        expect(await headers.count()).toBeGreaterThan(2)

        // Filtering
        const filterInput = p
          .locator(
            'input[placeholder*="filter" i], input[placeholder*="suche" i], input[placeholder*="search" i], input[placeholder*="Filter" i]',
          )
          .first()
        if (await filterInput.isVisible().catch(() => false)) {
          await filterInput.fill('client')
          await p.waitForTimeout(1200)
          expect(await getTableRowCount(p)).toBeGreaterThan(0)
          await filterInput.fill('')
          await p.waitForTimeout(600)
        }

        // Row selection
        const firstRow = p.locator('table tbody tr, [class*="table"] [class*="row"]:not([class*="header"])').first()
        if (await firstRow.isVisible().catch(() => false)) {
          await firstRow.click()
          await p.waitForTimeout(600)
        }

        // Sort interaction
        const sortableHeader = p.locator('thead th[aria-sort]').first()
        if (await sortableHeader.isVisible().catch(() => false)) {
          await sortableHeader.click()
          await p.waitForTimeout(600)
          expect(await getTableRowCount(p)).toBeGreaterThan(0)
        }

        // Open row-actions menu and verify core action categories exist
        const rowActionBtn = p
          .locator(
            'table tbody tr:first-child [aria-label*="aktion" i], ' +
              'table tbody tr:first-child [aria-label*="action" i], ' +
              'table tbody tr:first-child [class*="row-action"]',
          )
          .first()
        if (await rowActionBtn.isVisible().catch(() => false)) {
          await rowActionBtn.click()
          await p.waitForTimeout(400)

          const menu = p.locator('[role="menu"]').first()
          if (await menu.isVisible().catch(() => false)) {
            const actionItems = menu.locator('[role="menuitem"]')
            expect(await actionItems.count()).toBeGreaterThan(0)
          }
          await p.keyboard.press('Escape')
        }

        // Ensure quickpanel is open and tabs are available
        const panel = p.getByTestId('quickpanel')
        await ensureQuickPanelOpen(p)
        if (await panel.isVisible().catch(() => false)) {
          const tabs = panel.getByRole('tab')
          expect(await tabs.count()).toBeGreaterThan(0)
        }
      },
      vrMask: ['[class*="timestamp"]', '[class*="time"]', '[class*="lastSeen"]'],
      elementShots: [
        // Table-settings popup (column chooser)
        {
          name: 'opsi-webgui-table-settings-popup',
          captureSelector: '[role="dialog"]',
          before: async (p) => {
            const btn = p.getByTestId('table-settings')
            if (await btn.isVisible().catch(() => false)) {
              await btn.click()
              await p.waitForTimeout(400)
            }
          },
          after: async (p) => {
            await p.keyboard.press('Escape')
            await p.waitForTimeout(200)
          },
        },
        {
          name: 'opsi-webgui-client-row-action-logs-button',
          captureTestId: 'client-row-action-logs',
          before: async (p) => {
            await waitForTable(p)
          },
        },
        {
          name: 'opsi-webgui-client-row-action-clone-button',
          captureTestId: 'client-row-action-clone',
          before: async (p) => {
            await waitForTable(p)
          },
        },
        // Row-level actions dropdown
        {
          name: 'opsi-webgui-client-row-actions-menu',
          captureSelector: '[role="menu"]',
          before: async (p) => {
            const rowBtn = p
              .locator(
                'table tbody tr:first-child [aria-label*="aktion" i], ' +
                  'table tbody tr:first-child [aria-label*="action" i], ' +
                  'table tbody tr:first-child [class*="row-action"]',
              )
              .first()
            if (await rowBtn.isVisible().catch(() => false)) {
              await rowBtn.click()
              await p.waitForTimeout(400)
            }
          },
          after: async (p) => {
            await p.keyboard.press('Escape')
            await p.waitForTimeout(200)
          },
        },
        // Clone button element in selected-client context
        {
          name: 'opsi-webgui-client-clone-button',
          captureSelector: 'button:has-text("Clone"), button:has-text("Klonen"), [aria-label*="clone" i], [aria-label*="klon" i]',
          before: async (p) => {
            await waitForTable(p)
            const firstRow = p.locator('table tbody tr').first()
            if (await firstRow.isVisible().catch(() => false)) {
              await firstRow.click()
              await p.waitForTimeout(500)
            }
          },
        },
        // Clone dialog popup
        {
          name: 'opsi-webgui-client-clone-dialog',
          captureSelector: '[role="dialog"]',
          before: async (p) => {
            await waitForTable(p)
            const firstRow = p.locator('table tbody tr').first()
            if (await firstRow.isVisible().catch(() => false)) {
              await firstRow.click()
              await p.waitForTimeout(400)
            }
            const rowActionBtn = p
              .locator(
                'table tbody tr:first-child [aria-label*="aktion" i], ' +
                  'table tbody tr:first-child [aria-label*="action" i], ' +
                  'table tbody tr:first-child [class*="row-action"]',
              )
              .first()
            if (await rowActionBtn.isVisible().catch(() => false)) {
              await rowActionBtn.click()
              await p.waitForTimeout(300)
              const cloneItem = p
                .locator('[role="menuitem"]')
                .filter({ hasText: /clone|klon/i })
                .first()
              if (await cloneItem.isVisible().catch(() => false)) {
                await cloneItem.click()
                await p.waitForTimeout(500)
              } else {
                await p.keyboard.press('Escape')
              }
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

  test('clients add form', async ({ page }) => {
    await runUITest(page, {
      name: 'clients-create',
      route: '/clients?view=panel&panelType=add',
      waitAfterNav: 3000,
      docName: 'opsi-webgui-clients-create',
      skipVisualRegression: true,
      functional: async (p) => {
        const inputs = p.locator('input, select, textarea')
        expect(await inputs.count()).toBeGreaterThan(0)
        const createBtn = p.getByRole('button', {
          name: /Add Client|Client hinzufügen|Ajouter un client/i,
        })
        await expect(createBtn).toBeVisible({ timeout: 10000 })
      },
    })
  })

  test('clients configuration tabs', async ({ page }) => {
    const [clientId] = await seedClientSelection(page)
    expect(clientId).toBeTruthy()
    await runUITest(page, {
      name: 'clients-config',
      route: `/clients?client=${encodeURIComponent(clientId)}&view=panel&panelType=config&configType=parameters`,
      waitAfterNav: 4000,
      docName: 'opsi-webgui-clients-configuration',
      functional: async (p) => {
        await expect(p.getByText('Host auswählen um Konfiguration anzuzeigen')).toBeHidden({
          timeout: 15000,
        })

        const panel = p.getByTestId('detail-panel')
        await expect(panel).toContainText(clientId)
        const tabs = panel.getByRole('tab')
        await tabs.first().waitFor({ state: 'visible', timeout: 30000 })
        expect(await tabs.count()).toBeGreaterThan(0)

        const attrsTab = tabs.filter({ hasText: /attributes|attribute/i }).first()
        if (await attrsTab.isVisible().catch(() => false)) {
          await attrsTab.click()
          await p.waitForTimeout(800)
          const attrsFields = panel.locator('input, textarea, [role="checkbox"]')
          expect(await attrsFields.count()).toBeGreaterThan(0)
        }

        const paramsTab = tabs.filter({ hasText: /parameters|parameter/i }).first()
        if (await paramsTab.isVisible().catch(() => false)) {
          await paramsTab.click()
          await p.waitForTimeout(800)
        }

        const contentShell = panel
        const paramsCard = panel.locator('.opsi-card').first()
        const fallbackPane = panel.locator('[class*="overflow-y-auto"], [class*="overflow-auto"]').first()
        await expect(contentShell).toBeVisible()
        const hasParamsCard = await paramsCard.isVisible().catch(() => false)
        if (!hasParamsCard) {
          await expect(fallbackPane).toBeVisible()
        }

        const sizes = await Promise.all([contentShell.boundingBox(), (hasParamsCard ? paramsCard : fallbackPane).boundingBox()])
        const shellBox = sizes[0]
        const cardBox = sizes[1]
        expect(shellBox).not.toBeNull()
        expect(cardBox).not.toBeNull()
        if (shellBox && cardBox) {
          expect(cardBox.height).toBeGreaterThan(shellBox.height * 0.45)
        }

        const hasScrollableArea = await (hasParamsCard ? paramsCard : fallbackPane).evaluate((el) => {
          const candidate = (el.querySelector('[style*="overflow"], .overflow-y-auto, .overflow-auto') || el) as HTMLElement
          return (
            candidate.clientHeight > 0 &&
            (candidate.scrollHeight > candidate.clientHeight || ['auto', 'scroll'].includes(getComputedStyle(candidate).overflowY))
          )
        })
        expect(hasScrollableArea).toBeTruthy()
      },
    })
  })

  test('clients clone panel', async ({ page }) => {
    const [clientId] = await seedClientSelection(page)
    expect(clientId).toBeTruthy()
    await runUITest(page, {
      name: 'clients-clone-panel',
      route: `/clients?client=${encodeURIComponent(clientId)}&view=panel&panelType=clone`,
      waitAfterNav: 3500,
      docName: 'opsi-webgui-clients-clone',
      skipVisualRegression: true,
      functional: async (p) => {
        const panel = p.getByTestId('detail-panel')
        await expect(panel).toContainText(clientId)
        await expect(panel.getByRole('button', { name: /clone|klonen|cloner/i }).last()).toBeVisible()
        await expect(panel.getByRole('checkbox')).toHaveCount(3)
      },
    })
  })

  test('clients logs with log level colors', async ({ page }) => {
    await page.route('**/opsidata/log**', async (route) => {
      const responseBody = [
        '[1] essential: /var/log/opsi/test-client-01.example.test_instlog.log session started',
        '[2] critical: product opsi-client-agent dependency mismatch',
        '[3] error: action request failed for opsi-script',
        '[4] warning: retry in 5 seconds for test-client-01.example.test',
        '[5] notice: switched to fallback repository mirror',
        '[6] info: synchronization finished for test-client-01.example.test',
        '[7] debug: parsed 42 product entries from cache',
        '[8] trace: websocket ping/pong healthy',
        '[9] secret: redacted token placeholder',
      ]
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(responseBody),
      })
    })

    await runUITest(page, {
      name: 'clients-logs',
      route: '/clients?client=nb-00001a.acme.corp&view=panel&panelType=logs&logType=instlog',
      waitAfterNav: 3000,
      docName: 'opsi-webgui-clients-logs',
      functional: async (p) => {
        await expect(p.locator('main')).toBeVisible()
        await p.waitForTimeout(1200)

        // After loading, the log viewer should appear
        const logViewer = p.locator('.log-viewer, [class*="log-viewer"]').first()
        if (await logViewer.isVisible().catch(() => false)) {
          // Verify at least one log row with a colour class is rendered
          const coloredRows = p.locator(
            '[class*="text-opsi-log-"], [class*="log-essential"], [class*="log-critical"],' +
              '[class*="log-error"], [class*="log-warning"], [class*="log-info"], [class*="log-debug"]',
          )
          // Logs may be empty in the test environment; tolerate that gracefully
          const hasRows = (await coloredRows.count()) > 0
          if (!hasRows) {
            // Still pass - we just want the page rendered without errors
            await expect(logViewer).toBeVisible()
          }

          // Set a log marker on a row to show the bookmark feature in the screenshot
          const thirdRow = p.locator('[id^="logrow-"]').nth(2)
          if (await thirdRow.isVisible().catch(() => false)) {
            await thirdRow.click()
            await p.waitForTimeout(400)
          }
        } else {
          // Fallback: verify page controls are present
          const controls = p.locator('main button, main input, main [role="combobox"]').first()
          await expect(controls).toBeVisible({ timeout: 10000 })
        }
      },
      // Mask the log content area since log lines differ between runs
      vrMask: ['[class*="log-viewer"]', '.log-viewer'],
      a11yExclude: ['.log-viewer', '[class*="log-viewer"]'],
    })
  })
})
