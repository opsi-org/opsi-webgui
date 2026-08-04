/*
 * Unit tests for useAutoRefresh (messagebus-driven auto refresh).
 *
 * Regression focus: opsiconfd EventMessage objects arrive as
 * { type: "event", event: "host_created", channel: "event:host_created", ... }
 * (the event name is in the "event" field, NOT in "type"). The previous
 * implementation matched on msg.type only, so auto-refresh and the
 * "changes detected" alert never triggered for real messagebus events.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { reactive, toRef, nextTick } from 'vue'

vi.mock('vue', async () => {
	const actual = await vi.importActual<typeof import('vue')>('vue')
	return {
		...actual,
		onMounted: vi.fn((cb: () => void) => cb()),
	}
})

const mockStore = reactive({
	lastMsg: undefined as unknown,
	autoRefresh: true,
	isConnected: true,
	changesDetected: false,
	lastEventType: '',
	bus: undefined,
	connect: vi.fn(),
	disconnect: vi.fn(),
	send: vi.fn(),
	subscribeChannels: vi.fn(),
	setAutoRefresh: vi.fn((val: boolean) => {
		mockStore.autoRefresh = val
	}),
	setChangesDetected: vi.fn((val: boolean) => {
		mockStore.changesDetected = val
	}),
	setLastEvent: vi.fn((type: string) => {
		mockStore.lastEventType = type
		mockStore.changesDetected = true
	}),
})

vi.mock('~/stores/messageBusStore', () => ({
	useMessageBusStore: () => mockStore,
	createUUID: () => 'test-uuid',
	createMsgTemplate: () => ({ id: 'test-uuid' }),
}))

vi.mock('pinia', () => ({
	storeToRefs: (store: Record<string, unknown>) => ({
		lastMsg: toRef(store, 'lastMsg'),
	}),
}))

async function emitMessage(msg: unknown) {
	mockStore.lastMsg = msg
	await nextTick()
	// handleMessage is async — give it a microtask to run
	await Promise.resolve()
}

describe('useAutoRefresh', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.useFakeTimers()
		mockStore.lastMsg = undefined
		mockStore.autoRefresh = true
		mockStore.changesDetected = false
		mockStore.lastEventType = ''
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('detects opsiconfd EventMessage format (type="event" + event field)', async () => {
		const { useAutoRefresh } = await import('~/app/composables/useMessagebus')
		const cb = vi.fn()
		const { changesDetected, lastChangeEvent, lastChangeDescription } = useAutoRefresh(cb)

		await emitMessage({
			type: 'event',
			event: 'host_created',
			channel: 'event:host_created',
			data: { host: { id: 'client-1.opsi.org' } },
		})

		expect(changesDetected.value).toBe(true)
		expect(lastChangeEvent.value).toBe('host_created')
		expect(lastChangeDescription.value).toBe('Client created')
		expect(mockStore.setLastEvent).toHaveBeenCalledWith('host_created')

		// auto refresh is debounced
		expect(cb).not.toHaveBeenCalled()
		await vi.advanceTimersByTimeAsync(2100)
		expect(cb).toHaveBeenCalledTimes(1)
		expect(changesDetected.value).toBe(false)
	})

	it('falls back to the channel when the event field is missing', async () => {
		const { useAutoRefresh } = await import('~/app/composables/useMessagebus')
		const cb = vi.fn()
		const { changesDetected, lastChangeEvent } = useAutoRefresh(cb)

		await emitMessage({ type: 'event', channel: 'event:productOnClient_updated' })

		expect(changesDetected.value).toBe(true)
		expect(lastChangeEvent.value).toBe('productOnClient_updated')
	})

	it('provides human-readable descriptions for config/configState/log events', async () => {
		const { useAutoRefresh } = await import('~/app/composables/useMessagebus')
		const cb = vi.fn()
		const { lastChangeDescription } = useAutoRefresh(cb)

		await emitMessage({ type: 'event', event: 'config_updated', channel: 'event:config_updated' })
		expect(lastChangeDescription.value).toBe('Config updated')

		await emitMessage({
			type: 'event',
			event: 'configState_created',
			channel: 'event:configState_created',
		})
		expect(lastChangeDescription.value).toBe('Config state created')

		await emitMessage({ type: 'event', event: 'log_updated', channel: 'event:log_updated' })
		expect(lastChangeDescription.value).toBe('Log updated')
	})

	it('still matches messages with the event name directly in type', async () => {
		const { useAutoRefresh } = await import('~/app/composables/useMessagebus')
		const cb = vi.fn()
		const { changesDetected } = useAutoRefresh(cb)

		await emitMessage({ type: 'host_updated' })
		expect(changesDetected.value).toBe(true)
	})

	it('ignores unrelated events', async () => {
		const { useAutoRefresh } = await import('~/app/composables/useMessagebus')
		const cb = vi.fn()
		const { changesDetected } = useAutoRefresh(cb)

		await emitMessage({ type: 'event', event: 'user_connected', channel: 'event:user_connected' })
		await vi.advanceTimersByTimeAsync(3000)

		expect(changesDetected.value).toBe(false)
		expect(cb).not.toHaveBeenCalled()
	})

	it('detects configState events in default watchers', async () => {
		const { useAutoRefresh } = await import('~/app/composables/useMessagebus')
		const cb = vi.fn()
		const { changesDetected, lastChangeEvent } = useAutoRefresh(cb)

		await emitMessage({
			type: 'event',
			event: 'configState_updated',
			channel: 'event:configState_updated',
		})

		expect(changesDetected.value).toBe(true)
		expect(lastChangeEvent.value).toBe('configState_updated')
		await vi.advanceTimersByTimeAsync(2100)
		expect(cb).toHaveBeenCalledTimes(1)
	})

	it('scoped watchers (clients) ignore product events', async () => {
		const { useAutoRefreshClients } = await import('~/app/composables/useMessagebus')
		const cb = vi.fn()
		const { changesDetected } = useAutoRefreshClients(cb)

		await emitMessage({
			type: 'event',
			event: 'productOnClient_created',
			channel: 'event:productOnClient_created',
		})
		expect(changesDetected.value).toBe(false)

		await emitMessage({ type: 'event', event: 'host_deleted', channel: 'event:host_deleted' })
		expect(changesDetected.value).toBe(true)
	})

	it('scoped watchers (servers) react to config events and ignore product events', async () => {
		const { useAutoRefreshServers } = await import('~/app/composables/useMessagebus')
		const cb = vi.fn()
		const { changesDetected } = useAutoRefreshServers(cb)

		await emitMessage({
			type: 'event',
			event: 'productOnClient_updated',
			channel: 'event:productOnClient_updated',
		})
		expect(changesDetected.value).toBe(false)

		await emitMessage({
			type: 'event',
			event: 'config_updated',
			channel: 'event:config_updated',
		})
		expect(changesDetected.value).toBe(true)
	})

	it('does not auto-refresh when autoRefresh is disabled', async () => {
		const { useAutoRefresh } = await import('~/app/composables/useMessagebus')
		mockStore.autoRefresh = false
		const cb = vi.fn()
		const { changesDetected } = useAutoRefresh(cb)

		await emitMessage({ type: 'event', event: 'host_created', channel: 'event:host_created' })
		await vi.advanceTimersByTimeAsync(3000)

		expect(changesDetected.value).toBe(true) // alert stays visible
		expect(cb).not.toHaveBeenCalled()
	})

	it('debounces bursts of events into a single refresh', async () => {
		const { useAutoRefresh } = await import('~/app/composables/useMessagebus')
		const cb = vi.fn()
		useAutoRefresh(cb)

		await emitMessage({ type: 'event', event: 'host_created', channel: 'event:host_created' })
		await vi.advanceTimersByTimeAsync(500)
		await emitMessage({ type: 'event', event: 'host_updated', channel: 'event:host_updated' })
		await vi.advanceTimersByTimeAsync(500)
		await emitMessage({ type: 'event', event: 'host_deleted', channel: 'event:host_deleted' })

		await vi.advanceTimersByTimeAsync(2100)
		expect(cb).toHaveBeenCalledTimes(1)
	})

	it('manualRefresh triggers the callback and clears state', async () => {
		const { useAutoRefresh } = await import('~/app/composables/useMessagebus')
		mockStore.autoRefresh = false
		const cb = vi.fn()
		const { changesDetected, manualRefresh } = useAutoRefresh(cb)

		await emitMessage({ type: 'event', event: 'host_created', channel: 'event:host_created' })
		expect(changesDetected.value).toBe(true)

		manualRefresh()
		expect(cb).toHaveBeenCalledTimes(1)
		expect(changesDetected.value).toBe(false)
		expect(mockStore.setChangesDetected).toHaveBeenCalledWith(false)
	})

	it('dismissChanges clears state without refreshing', async () => {
		const { useAutoRefresh } = await import('~/app/composables/useMessagebus')
		mockStore.autoRefresh = false
		const cb = vi.fn()
		const { changesDetected, dismissChanges } = useAutoRefresh(cb)

		await emitMessage({ type: 'event', event: 'host_created', channel: 'event:host_created' })
		dismissChanges()

		expect(changesDetected.value).toBe(false)
		expect(cb).not.toHaveBeenCalled()
	})

	it('connects the messagebus on mount', async () => {
		const { useAutoRefresh } = await import('~/app/composables/useMessagebus')
		useAutoRefresh(vi.fn())
		expect(mockStore.connect).toHaveBeenCalled()
	})
})
