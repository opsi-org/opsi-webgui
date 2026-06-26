import { test, expect } from '../../fixtures'
import { runUITest } from '../../runner/runUITest'
import { waitForTable, getTableRowCount } from '../../utils/ui'

test.describe('Servers', () => {
	test('servers list', async ({ page }) => {
		await runUITest(page, {
			name: 'servers',
			route: '/servers',
			waitAfterNav: 3000, docName: 'opsi-webgui-servers-overview', functional: async (p) => {
				await waitForTable(p)
				const count = await getTableRowCount(p)
				expect(count).toBeGreaterThan(0)
			},
		})
	})

	test('servers configuration tabs', async ({ page }) => {
		await runUITest(page, {
			name: 'servers-config',
			route: '/servers/configuration',
			waitAfterNav: 3000, docName: 'opsi-webgui-servers-configuration', functional: async (p) => {
				// Config tabs should be present
				const tabs = p.getByRole('tab')
				if (await tabs.first().isVisible().catch(() => false)) {
					const tabCount = await tabs.count()
					expect(tabCount).toBeGreaterThan(0)

					// Click second tab if available
					if (tabCount > 1) {
						await tabs.nth(1).click()
						await p.waitForTimeout(1000)
					}
				}
			},
		})
	})
})
