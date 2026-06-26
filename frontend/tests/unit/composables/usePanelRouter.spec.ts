import { describe, it, expect, beforeEach, vi } from 'vitest'

/**
 * usePanelRouter relies on Nuxt/vue-router auto-imports (useRouter, useRoute,
 * onBeforeRouteLeave). We expose them as globals (the same mechanism the vitest
 * setup file uses for the Vue reactivity helpers) so the composable resolves
 * them at call time.
 */
const replace = vi.fn()
let routeQuery: Record<string, string> = {}
let leaveGuard: (() => boolean | Promise<boolean>) | null = null

function installAutoImports() {
	Object.assign(globalThis, {
		useRouter: () => ({ replace }),
		useRoute: () => ({ query: routeQuery }),
		onBeforeRouteLeave: (cb: () => boolean | Promise<boolean>) => {
			leaveGuard = cb
		},
	})
}

async function makeRouter(opts: {
	hasUnsavedChanges: () => boolean
	discardAllChanges?: () => void
	entityQueryKey?: string
	additionalQueryKeys?: string[]
}) {
	const mod = await import('~/app/composables/usePanelRouter')
	return mod.usePanelRouter({
		entityQueryKey: opts.entityQueryKey ?? 'id',
		hasUnsavedChanges: opts.hasUnsavedChanges,
		discardAllChanges: opts.discardAllChanges ?? (() => { }),
		additionalQueryKeys: opts.additionalQueryKeys,
	})
}

describe('usePanelRouter', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		routeQuery = {}
		leaveGuard = null
		installAutoImports()
	})

	describe('checkUnsavedAndDo', () => {
		it('runs the action immediately when there are no unsaved changes', async () => {
			const action = vi.fn()
			const r = await makeRouter({ hasUnsavedChanges: () => false })
			r.checkUnsavedAndDo(action)
			expect(action).toHaveBeenCalledOnce()
			expect(r.showLeaveWarning.value).toBe(false)
		})

		it('defers the action and shows the warning when there are unsaved changes', async () => {
			const action = vi.fn()
			const r = await makeRouter({ hasUnsavedChanges: () => true })
			r.checkUnsavedAndDo(action)
			expect(action).not.toHaveBeenCalled()
			expect(r.showLeaveWarning.value).toBe(true)
		})
	})

	describe('confirmLeave / cancelLeave', () => {
		it('confirmLeave discards changes, hides the warning and runs the pending action', async () => {
			const action = vi.fn()
			const discard = vi.fn()
			const r = await makeRouter({ hasUnsavedChanges: () => true, discardAllChanges: discard })
			r.checkUnsavedAndDo(action)
			r.confirmLeave()
			expect(discard).toHaveBeenCalledOnce()
			expect(action).toHaveBeenCalledOnce()
			expect(r.showLeaveWarning.value).toBe(false)
		})

		it('cancelLeave hides the warning and never runs the pending action', async () => {
			const action = vi.fn()
			const r = await makeRouter({ hasUnsavedChanges: () => true })
			r.checkUnsavedAndDo(action)
			r.cancelLeave()
			expect(action).not.toHaveBeenCalled()
			expect(r.showLeaveWarning.value).toBe(false)
		})
	})

	describe('onBeforeRouteLeave guard', () => {
		it('allows navigation straight away when nothing is unsaved', async () => {
			await makeRouter({ hasUnsavedChanges: () => false })
			expect(leaveGuard).toBeTypeOf('function')
			expect(leaveGuard!()).toBe(true)
		})

		it('blocks navigation until confirmLeave resolves the guard promise', async () => {
			const r = await makeRouter({ hasUnsavedChanges: () => true })
			const result = leaveGuard!() as Promise<boolean>
			expect(r.showLeaveWarning.value).toBe(true)
			r.confirmLeave()
			await expect(result).resolves.toBe(true)
		})

		it('rejects navigation when cancelLeave resolves the guard promise', async () => {
			const r = await makeRouter({ hasUnsavedChanges: () => true })
			const result = leaveGuard!() as Promise<boolean>
			r.cancelLeave()
			await expect(result).resolves.toBe(false)
		})
	})

	describe('setPanelQuery', () => {
		it('merges the entity id, view flag and extras into the route query', async () => {
			routeQuery = { existing: 'keep' }
			const r = await makeRouter({ hasUnsavedChanges: () => false, entityQueryKey: 'clientId' })
			r.setPanelQuery('client-1', { panelType: 'config' })
			expect(replace).toHaveBeenCalledWith({
				query: { existing: 'keep', clientId: 'client-1', view: 'panel', panelType: 'config' },
			})
		})
	})

	describe('clearPanelQuery', () => {
		it('removes the panel-related keys but keeps unrelated query params', async () => {
			routeQuery = {
				clientId: 'client-1',
				view: 'panel',
				panelType: 'config',
				configType: 'general',
				keepMe: 'yes',
			}
			const r = await makeRouter({ hasUnsavedChanges: () => false, entityQueryKey: 'clientId' })
			r.clearPanelQuery()
			expect(replace).toHaveBeenCalledWith({ query: { keepMe: 'yes' } })
		})

		it('also strips any additionalQueryKeys', async () => {
			routeQuery = { id: 'x', view: 'panel', tab: 'logs', keep: '1' }
			const r = await makeRouter({
				hasUnsavedChanges: () => false,
				additionalQueryKeys: ['tab'],
			})
			r.clearPanelQuery()
			expect(replace).toHaveBeenCalledWith({ query: { keep: '1' } })
		})
	})
})
