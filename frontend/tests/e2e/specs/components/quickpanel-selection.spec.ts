/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 */

import type { Locator, Page } from '@playwright/test'
import { test, expect } from '../../fixtures'
import { ensureQuickPanelOpen } from '../../utils/ui'

const parent = 'qp-parent'
const child = 'qp-child'
const other = 'qp-other'
const special = 'not_assigned'
const x = 'qp-x.test.invalid'
const y = 'qp-y.test.invalid'
const z = 'qp-z.test.invalid'
const w = 'qp-w.test.invalid'
const clients = [x, y, z, w]
const direct: Record<string, string[]> = { [parent]: [x], [child]: [y], [other]: [y, z], [special]: [w] }
const recursive: Record<string, string[]> = { ...direct, [parent]: [x, y] }

function group(id: string, type = 'HostGroup', children: Record<string, unknown> = {}) {
  return { id, text: id, type, member_count: direct[id]?.length ?? 0, children }
}

function memberNodes(id: string) {
  return Object.fromEntries((direct[id] ?? []).map((client) => [client, { id: `${client};${id}`, text: client, type: 'ObjectToGroup' }]))
}

async function mockGroups(page: Page) {
  const writes: string[] = []
  const directRequests: string[] = []
  await page.route(/\/opsidata\/(?:hosts|products)\/groups(?:-dynamic)?(?:\?|$|\/)/, async (route) => {
    const request = route.request()
    if (request.method() !== 'GET') {
      writes.push(`${request.method()} ${request.url()}`)
      await route.fulfill({ json: {} })
      return
    }
    const url = new URL(request.url())
    const type = url.pathname.includes('/products/') ? 'ProductGroup' : 'HostGroup'
    if (!url.pathname.endsWith('groups-dynamic')) {
      const tree = group('groups', type, {
        [parent]: group(parent, type, { [child]: group(child, type) }),
        [other]: group(other, type),
        [special]: group(special, type),
      })
      await route.fulfill({ json: type === 'HostGroup' ? tree : { groups: tree } })
      return
    }
    const id = url.searchParams.get('parentGroup') ?? ''
    if (url.searchParams.get('recursiveMembers') === 'true') {
      await route.fulfill({ json: { groups: group(id, type), members: recursive[id] ?? [] } })
    } else {
      directRequests.push(id)
      const children = { ...memberNodes(id), ...(id === parent ? { [child]: group(child, type) } : {}) }
      await route.fulfill({ json: { groups: group(id, type, children) } })
    }
  })
  await page.route(/\/opsidata\/clients(?:\?|$)/, (route) =>
    route.fulfill({
      headers: { 'X-Total-Count': String(clients.length) },
      json: clients.map((clientId) => ({ clientId, depotId: 'depot.test.invalid', reachable: false })),
    }),
  )
  await page.route('**/opsidata/depots/clients*', (route) => route.fulfill({ json: clients }))
  await page.addInitScript(() => {
    localStorage.removeItem('opsi-webgui-selection')
  })
  return { writes, directRequests }
}

async function openTree(page: Page, type: 'clients' | 'products' = 'clients') {
  await ensureQuickPanelOpen(page)
  await page
    .getByTestId('quickpanel')
    .getByRole('tab')
    .nth(type === 'clients' ? 2 : 3)
    .click()
  const tree = page.getByTestId(`quickpanel-tab-${type}`)
  const section = tree.getByRole('button', { name: /^(Groups|Gruppen|Groupes)$/ })
  await expect(section).toBeVisible()
  if ((await section.getAttribute('aria-expanded')) === 'false') await section.click()
  await expect(tree.getByRole('checkbox', { name: parent, exact: true })).toBeVisible()
  return tree
}

function treeRow(tree: Locator, id: string) {
  return tree.getByRole('button', { name: id, exact: true }).locator('..')
}

async function expand(tree: Locator, id: string) {
  await treeRow(tree, id)
    .getByRole('button', { name: /^(Expand|Ausklappen|Déplier)$/ })
    .click()
}

async function expectSelected(page: Page, ids: string[], type: 'Clients' | 'Products' = 'Clients') {
  await expect
    .poll(() =>
      page.evaluate((key) => {
        const selection = JSON.parse(localStorage.getItem('opsi-webgui-selection') ?? '{}')
        return (selection[key] ?? []).slice().sort()
      }, `selected${type}`),
    )
    .toEqual([...ids].sort())
}

test.describe('Quick Panel selection and direct memberships', () => {
  for (const loadChild of [false, true]) {
    test(`parent selection preserves Groups members with child loaded=${loadChild}`, async ({ page }) => {
      const { writes, directRequests } = await mockGroups(page)
      await page.goto('/groups')
      const groupButton = (id: string) => page.locator('.group-tree-node > div:first-child').getByRole('button', { name: id, exact: true })
      await groupButton(parent).click()
      const members = page.locator('[class~="group/member"]')
      await expect(members).toHaveText([x])
      if (loadChild) {
        await groupButton(child).click()
        await expect(members).toHaveText([y])
        await groupButton(parent).click()
        await expect(members).toHaveText([x])
      }

      const tree = await openTree(page)
      const requestsBefore = [...directRequests]
      const checkbox = tree.getByRole('checkbox', { name: parent, exact: true })
      await checkbox.click()
      await expectSelected(page, [x, y])
      await expect(checkbox).toBeChecked()
      await expect(members).toHaveText([x])
      await checkbox.click()
      await expectSelected(page, [])
      await checkbox.click()
      await expectSelected(page, [x, y])
      await expect(members).toHaveText([x])
      expect(directRequests).toEqual(requestsBefore)
      expect(writes).toEqual([])

      await groupButton(child).click()
      await expect(members).toHaveText([y])
      await groupButton(parent).click()
      await expect(members).toHaveText([x])
    })
  }

  test('overlapping groups and table rows share one selection per client', async ({ page }) => {
    const { writes } = await mockGroups(page)
    await page.goto('/clients')
    const tree = await openTree(page)
    const parentBox = tree.getByRole('checkbox', { name: parent, exact: true })
    const otherBox = tree.getByRole('checkbox', { name: other, exact: true })
    await parentBox.click()
    await expectSelected(page, [x, y])
    await expect(parentBox).toBeChecked()
    await expand(tree, parent)
    await expect(tree.getByRole('checkbox', { name: child, exact: true })).toBeVisible()
    await expand(tree, child)
    await expand(tree, other)
    await expect(tree.getByRole('checkbox', { name: y, exact: true })).toHaveCount(2)
    await otherBox.click()
    await expectSelected(page, [x, y, z])
    await expect(otherBox).toBeChecked()

    const tableBox = (id: string) => page.locator(`tr[id="clients-row-${id}"]`).getByRole('checkbox')
    await expect(tableBox(y)).toBeChecked()
    await tableBox(y).click()
    await expectSelected(page, [x, z])
    for (const box of await tree.getByRole('checkbox', { name: y, exact: true }).all()) await expect(box).not.toBeChecked()
    await expect(parentBox).toHaveAttribute('aria-checked', 'mixed')
    await expect(otherBox).toHaveAttribute('aria-checked', 'mixed')

    await tree.getByRole('checkbox', { name: y, exact: true }).first().click()
    await expectSelected(page, [x, y, z])
    await expect(tableBox(y)).toBeChecked()
    await tree.getByRole('checkbox', { name: y, exact: true }).last().click()
    await expectSelected(page, [x, z])
    await expect(tableBox(y)).not.toBeChecked()
    await parentBox.click()
    await expectSelected(page, [x, y, z])
    await tableBox(w).click()
    await expectSelected(page, [x, y, z, w])
    await treeRow(tree, parent)
      .getByRole('button', { name: /^(Collapse|Einklappen|Replier)$/ })
      .click()
    await expect(parentBox).toBeChecked()
    await expand(tree, parent)
    await expect(parentBox).toBeChecked()
    await parentBox.click()
    await expectSelected(page, [z, w])
    await expect(parentBox).not.toBeChecked()
    await expect(otherBox).toHaveAttribute('aria-checked', 'mixed')
    expect(writes).toEqual([])
  })

  test('special groups retain lazy-loaded direct members', async ({ page }) => {
    const { writes } = await mockGroups(page)
    await page.goto('/groups')
    const tree = await openTree(page)
    const checkbox = tree.getByRole('checkbox', { name: special, exact: true })
    await checkbox.click()
    await expectSelected(page, [w])
    await expect(checkbox).toBeChecked()
    await expand(tree, special)
    await expect(tree.getByRole('checkbox', { name: w, exact: true })).toBeChecked()
    await checkbox.click()
    await expectSelected(page, [])
    expect(writes).toEqual([])
  })

  test('product group selection does not flatten nested members', async ({ page }) => {
    const { writes } = await mockGroups(page)
    await page.goto('/groups?groupTab=products')
    await page.locator('.group-tree-node > div:first-child').getByRole('button', { name: parent, exact: true }).click()
    const members = page.locator('[class~="group/member"]')
    await expect(members).toHaveText([x])
    const tree = await openTree(page, 'products')
    const checkbox = tree.getByRole('checkbox', { name: parent, exact: true })
    await checkbox.click()
    await expectSelected(page, [x, y], 'Products')
    await expect(checkbox).toBeChecked()
    await expect(members).toHaveText([x])
    await checkbox.click()
    await expectSelected(page, [], 'Products')
    expect(writes).toEqual([])
  })
})
