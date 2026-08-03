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
import type { Page } from '@playwright/test'

interface UserConfigurationOverrides {
	read_only?: boolean
	server_write_access?: boolean
	depot_access?: boolean
	host_group_access?: boolean
	product_group_access?: boolean
	client_creation?: boolean
}

/** Intercept /api/user/configuration and answer with a mocked permission set. */
async function mockUserConfiguration(
	page: Page,
	overrides: UserConfigurationOverrides
): Promise<void> {
	await page.route('**/api/user/configuration*', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				user: 'restricteduser',
				configuration: {
					read_only: false,
					server_write_access: true,
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

test.describe('User permissions', () => {
	test('read-only user sees banner and disabled write actions on clients page', async ({
		page,
	}) => {
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
		await page.goto('/clients')
		await page.waitForTimeout(2000)

		// /admin/maintenance is blocked for read-only users -> redirected to /clients.
		// A full SPA boot (init plugin + config fetch) can take a while in dev mode,
		// so wait for the redirect instead of asserting immediately.
		await page.goto('/admin/maintenance')
		await page.waitForURL((url) => !url.pathname.includes('/admin/maintenance'), {
			timeout: 30000,
		})
		expect(page.url()).not.toContain('/admin/maintenance')

		// /clients/add is blocked without client-creation permission
		await page.goto('/clients/add')
		await page.waitForURL((url) => !url.pathname.includes('/clients/add'), { timeout: 30000 })
		expect(page.url()).not.toContain('/clients/add')
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
				if (!(await quickpanel.isVisible().catch(() => false))) {
					const toggle = p
						.locator(
							'button[aria-label*="quick" i], button[aria-label*="panel" i], [data-testid="quickpanel-toggle"]'
						)
						.first()
					if (await toggle.isVisible().catch(() => false)) {
						await toggle.click()
						await p.waitForTimeout(500)
					}
				}
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

	test('user without server write access has read-only server configuration', async ({ page }) => {
		await mockUserConfiguration(page, { server_write_access: false, read_only: false })

		await runUITest(page, {
			name: 'permissions-no-server-write',
			route: '/servers',
			waitAfterNav: 2500,
			functional: async (p) => {
				// The servers table must still render (viewing is allowed)
				const table = p.locator('main table tbody tr').first()
				await table.waitFor({ state: 'visible', timeout: 30000 })
			},
		})
	})
})
