import { test, expect } from '../../fixtures'
import { runUITest } from '../../runner/runUITest'

test.describe('Groups', () => {
  test('groups tree view', async ({ page }) => {
    await runUITest(page, {
      name: 'groups',
      route: '/groups',
      waitAfterNav: 3000,
      docName: 'opsi-webgui-groups-overview',
      functional: async (p) => {
        // Tree or group content should be visible
        const tree = p
          .locator('[class*="tree"], [class*="group"], [role="tree"], [role="treeitem"]')
          .first()
        await tree.waitFor({ state: 'visible', timeout: 10000 })

        // Should have at least one tree node/group
        const nodes = p.locator(
          '[class*="tree-node"], [class*="group-item"], [role="treeitem"], [class*="node"]'
        )
        expect(await nodes.count()).toBeGreaterThan(0)
      },
    })
  })

  test('groups tree expand', async ({ page }) => {
    await page.goto('/groups', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)

    // Try to expand first tree node
    const expandBtn = page
      .locator('[class*="tree"] button, [class*="expand"], [class*="toggle"]')
      .first()
    if (await expandBtn.isVisible().catch(() => false)) {
      await expandBtn.click()
      await page.waitForTimeout(1000)
      // After expand, children should be visible
      const children = page.locator('[class*="tree-node"], [role="treeitem"], [class*="child"]')
      expect(await children.count()).toBeGreaterThan(0)
    }
  })
})
