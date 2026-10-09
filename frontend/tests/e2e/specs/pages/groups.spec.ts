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
import { runUITest } from '../../runner/runUITest'

const addMembersHeading = /^(Add Members|Mitglieder hinzufügen)$/

async function expectAddMembersHeading(page: import('@playwright/test').Page, groupName?: string): Promise<void> {
  await expect(page.getByText(addMembersHeading).first()).toBeVisible()
  if (groupName) await expect(page.getByText(groupName, { exact: true }).last()).toBeVisible()
}

const testHostGroupIds: string[] = []

function groupRow(page: import('@playwright/test').Page, groupId: string) {
  return page.getByRole('button', { name: groupId, exact: true }).locator('xpath=../..')
}

async function createHostGroup(page: import('@playwright/test').Page, groupId: string): Promise<void> {
  await page
    .getByRole('button', { name: /^(Create Group|Gruppe erstellen)$/ })
    .first()
    .click()
  await page.getByLabel(/^(Group ID|Gruppen-ID)$/).fill(groupId)
  await page.getByRole('button', { name: /^(Create|Erstellen)$/ }).click()
  await expect(page.getByRole('button', { name: groupId, exact: true })).toBeVisible()
}

test.describe('Groups', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    testHostGroupIds.length = 0
    if (testInfo.title.startsWith('product group plus')) return

    await page.goto('/groups')

    const groupPrefix = `webgui-e2e-${testInfo.workerIndex}-${Date.now()}`
    for (const suffix of ['first', 'second']) {
      const groupId = `${groupPrefix}-${suffix}`
      await createHostGroup(page, groupId)
      testHostGroupIds.push(groupId)
    }
  })

  test.afterEach(async ({ page }) => {
    for (const groupId of testHostGroupIds) {
      const row = groupRow(page, groupId)
      if (!(await row.count())) continue
      await row.getByRole('button', { name: /^(Delete|Löschen)$/ }).click()
      const dialog = page.getByRole('dialog')
      await dialog.getByRole('button', { name: /^(Delete|Löschen)$/ }).click()
      await expect(page.getByRole('button', { name: groupId, exact: true })).toHaveCount(0)
    }
    testHostGroupIds.length = 0
  })

  test('tree plus opens inline client selection for its own group', async ({ page }) => {
    const candidate = 'inline-add-candidate.test.invalid'
    await page.route('**/opsidata/depots/clients*', (route) => route.fulfill({ json: [candidate] }))
    await page.goto('/groups')

    const targetLabel = testHostGroupIds[0]
    const targetRow = groupRow(page, targetLabel)
    const plusButton = targetRow.getByRole('button', { name: addMembersHeading })
    await expect(plusButton).toBeVisible()
    await expect(page.getByText(/^(All Clients|Alle Clients)$/).first()).toBeVisible()

    await plusButton.click()

    await expectAddMembersHeading(page, targetLabel)
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByRole('button', { name: candidate })).toBeVisible()

    await page.getByRole('button', { name: candidate }).click()
    const addButton = page.getByRole('button', { name: /^(Add|Hinzufügen) \(1\)$/ })
    await expect(addButton).toBeEnabled()

    let failNextAdd = true
    await page.route('**/opsidata/hosts/groups/*/clients', async (route) => {
      expect(decodeURIComponent(route.request().url())).toContain(`/groups/${targetLabel}/clients`)
      expect(route.request().postDataJSON()).toEqual([candidate])
      await route.fulfill(failNextAdd ? { status: 500, json: { error: 'Test error' } } : { status: 200, json: null })
    })
    await addButton.click()
    await expectAddMembersHeading(page, targetLabel)
    await expect(addButton).toBeEnabled()

    failNextAdd = false
    await addButton.click()
    await expect(page.getByText(targetLabel!, { exact: true }).last()).toBeVisible()
    await expect(addButton).toHaveCount(0)
    await targetRow.getByRole('button', { name: addMembersHeading }).click()
    await page
      .getByRole('button', { name: /^(Back|Zurück)$/ })
      .last()
      .click()
    await expect(page.getByText(targetLabel!, { exact: true }).last()).toBeVisible()

    await targetRow.locator('button[class*="flex-1"]').first().click()
    await expect(page.getByText(/^(All Clients|Alle Clients)$/).first()).toBeVisible()
    await expect(page.getByText(candidate, { exact: true })).toBeVisible()
  })

  test('tree plus targets its row even when another group is selected', async ({ page }) => {
    const candidate = 'cross-group-candidate.test.invalid'
    await page.route('**/opsidata/depots/clients*', (route) => route.fulfill({ json: [candidate] }))
    await page.goto('/groups')
    const [firstLabel, secondLabel] = testHostGroupIds
    const rowOf = (label: string) =>
      page.locator('.group-tree-node > div:first-child').filter({ has: page.getByRole('button', { name: label, exact: true }) })
    const firstRow = rowOf(firstLabel!)
    const secondRow = rowOf(secondLabel!)
    await expect(firstRow.getByRole('button', { name: addMembersHeading })).toBeVisible()
    await expect(secondRow.getByRole('button', { name: addMembersHeading })).toBeVisible()

    const dropped = page.waitForRequest(
      (request) => request.url().includes('/opsidata/hosts/groups/') && request.url().endsWith('/clients'),
    )
    await page.route('**/opsidata/hosts/groups/*/clients', (route) => route.fulfill({ status: 200, json: null }))
    await page.getByText(candidate, { exact: true }).locator('xpath=..').dragTo(secondRow)
    const dropRequest = await dropped
    expect(decodeURIComponent(dropRequest.url())).toContain(`/groups/${secondLabel}/clients`)
    expect(dropRequest.postDataJSON()).toEqual([candidate])
    await expect(page.getByText(candidate, { exact: true })).toBeVisible()

    await firstRow.getByRole('button', { name: firstLabel, exact: true }).click()
    await expect(page.getByText(firstLabel!, { exact: true }).last()).toBeVisible()

    await secondRow.getByRole('button', { name: addMembersHeading }).click()
    await expectAddMembersHeading(page, secondLabel)
    await page.getByRole('button', { name: candidate }).click()
    const otherGroupDrop = page.waitForRequest(
      (request) => request.url().includes('/opsidata/hosts/groups/') && request.url().endsWith('/clients'),
    )
    await page.getByRole('button', { name: candidate }).dragTo(firstRow)
    expect(decodeURIComponent((await otherGroupDrop).url())).toContain(`/groups/${firstLabel}/clients`)
    await expect(page.getByRole('button', { name: /^(Add|Hinzufügen) \(1\)$/ })).toBeEnabled()
    await page
      .getByRole('button', { name: /^(Back|Zurück)$/ })
      .last()
      .click()
    await expect(page.getByText(firstLabel!, { exact: true }).last()).toBeVisible()
  })

  test('clicking the selected group returns from actions without deselecting it', async ({ page }) => {
    await page.goto('/groups')
    await expect(page.getByText(/^(All Clients|Alle Clients)$/).first()).toBeVisible()
    const [groupId, otherGroupId] = testHostGroupIds
    const row = groupRow(page, groupId!)
    const groupButton = row.getByRole('button', { name: groupId, exact: true })
    const selectedHeading = page.getByText(/^(Group|Gruppe): .+$/)
    await groupButton.click()
    await expect(selectedHeading).toContainText(groupId!)

    for (const action of [addMembersHeading, /^(Add Subgroup|Untergruppe hinzufügen)$/, /^(Edit|Bearbeiten)$/]) {
      await row.getByRole('button', { name: action }).click()
      await expect(page.getByRole('button', { name: /^(Back|Zurück)$/ })).toBeVisible()
      await groupButton.click()
      await expect(selectedHeading).toContainText(groupId!)
      await expect(page.getByRole('button', { name: /^(Back|Zurück)$/ })).toHaveCount(0)
    }

    await row.getByRole('button', { name: addMembersHeading }).click()
    await expectAddMembersHeading(page, groupId)
    const otherGroupButton = groupRow(page, otherGroupId!).getByRole('button', { name: otherGroupId, exact: true })
    await otherGroupButton.click()
    await expect(selectedHeading).toContainText(otherGroupId!)
    await otherGroupButton.click()
    await expect(page.getByText(/^(All Clients|Alle Clients)$/).first()).toBeVisible()
  })

  test('member drag disables its source group but permits other groups and new candidates', async ({ page }) => {
    const [sourceGroupId, targetGroupId] = testHostGroupIds
    const member = 'source-group-member.test.invalid'
    const candidate = 'new-group-member.test.invalid'
    await page.route('**/opsidata/depots/clients*', (route) => route.fulfill({ json: [member, candidate] }))
    await page.route('**/opsidata/hosts/groups-dynamic*', (route) => {
      const parentGroup = new URL(route.request().url()).searchParams.get('parentGroup')
      if (parentGroup !== sourceGroupId) return route.fallback()
      return route.fulfill({
        json: { groups: { children: { member: { id: member, text: member, type: 'ObjectToGroup' } } } },
      })
    })
    const dropTargets: string[] = []
    await page.route('**/opsidata/hosts/groups/*/clients', (route) => {
      const targetId = decodeURIComponent(new URL(route.request().url()).pathname.split('/').at(-2)!)
      dropTargets.push(targetId)
      return route.fulfill({ json: null })
    })
    await page.goto('/groups')
    const sourceRow = groupRow(page, sourceGroupId!).locator(':scope > div').first()
    const targetRow = groupRow(page, targetGroupId!).locator(':scope > div').first()
    await sourceRow.getByRole('button', { name: sourceGroupId, exact: true }).click()
    await expect(page.getByText(/^(Group|Gruppe): .+$/)).toContainText(sourceGroupId!)
    const memberRow = page.getByText(member, { exact: true }).locator('xpath=..')
    await expect(memberRow).toBeVisible()
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())
    await memberRow.dispatchEvent('dragstart', { dataTransfer })
    await expect(sourceRow).toHaveCSS('opacity', '0.5')
    await expect(sourceRow).toHaveCSS('cursor', 'not-allowed')
    await expect(targetRow).toHaveCSS('opacity', '1')
    await sourceRow.dispatchEvent('dragover', { dataTransfer })
    await sourceRow.dispatchEvent('drop', { dataTransfer })
    expect(dropTargets).toEqual([])
    await memberRow.dispatchEvent('dragend', { dataTransfer })
    await memberRow.dispatchEvent('dragstart', { dataTransfer })
    await expect(sourceRow).toHaveCSS('opacity', '0.5')
    await targetRow.dispatchEvent('dragover', { dataTransfer })
    await expect(targetRow).toHaveClass(/bg-success\/10/)
    await targetRow.dispatchEvent('drop', { dataTransfer })
    await expect.poll(() => dropTargets).toEqual([targetGroupId])
    await memberRow.dispatchEvent('dragend', { dataTransfer })
    await expect(sourceRow).toHaveCSS('opacity', '1')
    await dataTransfer.dispose()
    await page.goto('/groups')
    await sourceRow.getByRole('button', { name: sourceGroupId, exact: true }).click()
    await expect(page.getByText(/^(Group|Gruppe): .+$/)).toContainText(sourceGroupId!)
    await sourceRow.getByRole('button', { name: addMembersHeading }).click()
    const candidateRow = page.getByRole('button', { name: candidate, exact: true }).locator('xpath=..')
    await expect(candidateRow).toBeVisible()
    const candidateTransfer = await page.evaluateHandle(() => new DataTransfer())
    await candidateRow.dispatchEvent('dragstart', { dataTransfer: candidateTransfer })
    await expect(sourceRow).toHaveCSS('opacity', '1')
    await sourceRow.dispatchEvent('dragover', { dataTransfer: candidateTransfer })
    await expect(sourceRow).toHaveClass(/bg-success\/10/)
    await sourceRow.dispatchEvent('drop', { dataTransfer: candidateTransfer })
    await expect.poll(() => dropTargets).toEqual([targetGroupId, sourceGroupId])
    await candidateRow.dispatchEvent('dragend', { dataTransfer: candidateTransfer })
    await candidateTransfer.dispose()
  })

  test('tree actions are always visible without hover or focus', async ({ page }) => {
    await page.goto('/groups')
    const plusButton = groupRow(page, testHostGroupIds[0]).getByRole('button', { name: addMembersHeading })
    await expect(plusButton).toBeVisible()
    await expect(plusButton).toHaveCSS('opacity', '1')
  })

  test.describe('touch', () => {
    test.use({ hasTouch: true, viewport: { width: 390, height: 844 } })

    test('product group plus is visible and opens the right panel', async ({ page }) => {
      await page.route('**/opsidata/depots/products*', (route) => route.fulfill({ json: [{ productId: 'inline-add-product' }] }))
      await page.goto('/groups?groupTab=products')

      const plusButton = page.getByRole('button', { name: /^(Add Members|Mitglieder hinzufügen)$/ }).first()
      await expect(plusButton).toBeVisible()
      await plusButton.click()
      await expectAddMembersHeading(page)
      await expect(page.getByRole('button', { name: 'inline-add-product' })).toBeVisible()
      await expect(page.getByRole('dialog')).toHaveCount(0)
      await page
        .getByRole('button', { name: /^(Back|Zurück)$/ })
        .last()
        .click()
      await expect(plusButton).toBeVisible()
    })
  })

  test('inline selection exposes candidates beyond the first page', async ({ page }) => {
    const candidates = Array.from({ length: 205 }, (_, index) => `candidate-${String(index).padStart(3, '0')}.test.invalid`)
    await page.route('**/opsidata/depots/clients*', (route) => route.fulfill({ json: candidates }))
    await page.goto('/groups')
    await groupRow(page, testHostGroupIds[0]).getByRole('button', { name: addMembersHeading }).click()

    await expect(page.getByRole('button', { name: candidates[204] })).toHaveCount(0)
    await page.getByRole('button', { name: /^(Show More|Mehr anzeigen)/ }).click()
    await expect(page.getByRole('button', { name: candidates[204] })).toBeVisible()
    await page.getByRole('checkbox', { name: /^(Select All|Alle auswählen)$/ }).click()
    await expect(page.getByRole('button', { name: /^(Add|Hinzufügen) \(205\)$/ })).toBeEnabled()
  })

  test('groups with one group selected', async ({ page }) => {
    await runUITest(page, {
      name: 'groups-selected',
      route: '/groups',
      waitAfterNav: 3000,
      docName: 'opsi-webgui-groups-selected',
      functional: async (p) => {
        const firstNode = p.getByRole('button', { name: testHostGroupIds[0], exact: true })
        await firstNode.waitFor({ state: 'visible', timeout: 30000 })
        const firstGroupName = (await firstNode.innerText()).trim()
        await firstNode.click()

        const selectedHeading = p.getByText(/^(Group|Gruppe): .+$/)
        await expect(selectedHeading).toBeVisible()
        await expect(selectedHeading).toContainText(firstGroupName)

        // Members should be visible in the right detail area for documentation screenshot.
        const membersPanel = p
          .locator('aside table tbody tr, aside [class*="member"], main [class*="detail"] table tbody tr, main [class*="member"]')
          .first()
        await membersPanel.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined)
      },
      vrMask: ['[class*="timestamp"]'],
      elementShots: [
        {
          name: 'opsi-webgui-groups-create-subgroup-dialog',
          captureSelector: '[role="dialog"]',
          before: async (p) => {
            const createBtn = p
              .locator(
                'button:has-text("Create"), button:has-text("Erstellen"), button:has-text("Untergruppe"), [aria-label*="create" i], [aria-label*="neu" i]',
              )
              .first()
            if (await createBtn.isVisible().catch(() => false)) {
              await createBtn.click()
              await p.waitForTimeout(500)
            }
          },
          after: async (p) => {
            await p.keyboard.press('Escape')
            await p.waitForTimeout(200)
          },
        },
        {
          name: 'opsi-webgui-groups-edit-group-dialog',
          captureSelector: '[role="dialog"]',
          before: async (p) => {
            const editBtn = p
              .locator('button:has-text("Edit"), button:has-text("Bearbeiten"), [aria-label*="edit" i], [aria-label*="bearbeit" i]')
              .first()
            if (await editBtn.isVisible().catch(() => false)) {
              await editBtn.click()
              await p.waitForTimeout(500)
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
