import { test, expect } from '../../fixtures'
import { runUITest } from '../../runner/runUITest'

test.describe('Groups', () => {
  test('groups with one group selected', async ({ page }) => {
    await runUITest(page, {
      name: 'groups-selected',
      route: '/groups',
      waitAfterNav: 3000,
      docName: 'opsi-webgui-groups-selected',
      functional: async (p) => {
        // Wait for the tree to render
        const tree = p.locator('main [class*="tree"], main [class*="group"], main [role="tree"], main [role="treeitem"]').first()
        await tree.waitFor({ state: 'visible', timeout: 30000 })

        // Click the first leaf group node to select it
        const firstNode = p.locator('main [role="treeitem"], main [class*="tree-node"], main [class*="group-item"], main button').first()
        if (await firstNode.isVisible().catch(() => false)) {
          await firstNode.click()
          await p.waitForTimeout(1000)

          // The selected node should have an active/selected class or aria-selected
          const selected = p.locator('main [aria-selected="true"], main [class*="selected"], main [class*="active"]').first()
          await expect(selected).toBeVisible({ timeout: 5000 })

          // Members should be visible in the right detail area for documentation screenshot.
          const membersPanel = p
            .locator('aside table tbody tr, aside [class*="member"], main [class*="detail"] table tbody tr, main [class*="member"]')
            .first()
          await membersPanel.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined)
        }
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
