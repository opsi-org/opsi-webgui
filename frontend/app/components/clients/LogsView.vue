<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ClientsLogsView - Client log viewer with log type selection and search.
-->
<template>
	<LayoutsPageLayout :loading="loading">
		<template #filters>
			<slot name="clientSelector">
				<HostsSelector v-if="showClientSelector" v-model="clientSelectorModel" type="client"
					:placeholder="clientSelectorPlaceholder || String($t('clients.select'))" :allow-all="false"
					allow-clear />

			</slot>
			<CoreAppSelectMenu v-model="selectedLogTypeValue" :placeholder="$t('logs.selectType')" :items="LOG_TYPES"
				:loading="loading" value-key="value" label-key="label" class="min-w-30" size="sm" />
			<div v-if="logContent.length > 0" class="flex flex-col gap-1 min-w-30">
				<span class="text-xs font-medium text-muted">
					{{ $t('logs.level') }}: <span class="font-bold">{{ logLevel }}</span>
					<span class="ml-1 text-muted">({{ LOG_LEVEL_LABELS[logLevel] }})</span>
				</span>
				<input v-model.number="logLevel" type="range" min="1" max="9" step="1"
					:aria-label="String($t('logs.level'))"
					class="opsi-log-level-slider w-full h-2 rounded-full appearance-none cursor-pointer" />
			</div>
		</template>
		<template #actions>
			<div v-if="resolvedClientId" class="flex gap-2">
				<div v-if="logContent.length > 0">
					<CoreAppFilterInput v-model="filterQuery" size="sm" input-class="w-full sm:w-56 md:w-72 lg:w-80" />
				</div>
				<div v-if="logContent.length > 0">
					<CoreAppButton color="primary" :variant="autoRefresh ? 'solid' : 'outline'" size="sm"
						@click="autoRefresh = !autoRefresh" :aria-label="String($t('settings.autoRefresh'))"
						:title="String($t('settings.autoRefreshDesc'))">
						<CoreAppIcon :name="icons.check" class="w-4 h-4" v-if="autoRefresh" />
						<span class="hidden sm:inline text-xs">{{ $t('settings.autoRefresh') }}</span>
					</CoreAppButton>
				</div>
				<div v-if="logContent.length > 0">
					<CoreAppButton :color="autoScroll ? 'primary' : 'neutral'"
						:variant="autoScroll && !hasMarker ? 'solid' : 'ghost'" :disabled="hasMarker" size="sm"
						@click="autoScroll = !autoScroll" :aria-label="String($t('settings.autoScroll'))"
						:title="String($t('settings.autoScrollDesc'))">
						<span class="hidden sm:inline text-xs">{{ $t('settings.autoScroll') }}</span>
					</CoreAppButton>
				</div>

				<div v-if="selectedLogTypeValue">
					<CoreAppButton :icon="icons.download" variant="outline" color="primary" size="sm"
						:aria-label="String($t('common.download'))" :title="String($t('common.download'))"
						:disabled="filteredLogContent.length === 0" @click="downloadLog">{{
							$t('common.download') }}</CoreAppButton>
				</div>

				<div v-if="selectedLogTypeValue">
					<CoreAppButton :icon="icons.refresh" variant="outline" color="primary" size="sm"
						:aria-label="String($t('common.refresh'))" :title="String($t('common.refresh'))"
						:loading="loading" @click="fetchLog" />
				</div>
			</div>
		</template>

		<div class="flex flex-col h-full gap-2 min-h-0">
			<div v-if="logContent.length > 0 && hasMarker" class="flex items-center text-xs text-muted shrink-0 px-3">
				<CoreAppButton :icon="icons.bookmark" variant="soft" color="neutral" size="sm"
					:title="String($t('logs.scroll'))" :aria-label="String($t('logs.scroll'))" @click="scrollToMarker">
					{{ $t('logs.marker') }}: {{ markerLine + 1 }}
				</CoreAppButton>
				<CoreAppButton :icon="icons.x" variant="ghost" color="neutral" size="sm"
					:title="String($t('logs.clearMarker'))" :aria-label="String($t('logs.clearMarker'))"
					@click="clearMarker" />
			</div>


			<CoreAppAlertInline v-if="logUpdatePending" color="info" :title="$t('bus.title')"
				:description="$t('bus.logUpdated')" class="shrink-0">
				<template #actions>
					<CoreAppButton size="xs" color="primary" @click="dismissAndFetch">{{ $t('common.reload') }}
					</CoreAppButton>
					<CoreAppButton size="xs" variant="ghost" color="neutral" @click="logUpdatePending = false">{{
						$t('common.dismiss') }}
					</CoreAppButton>
				</template>
			</CoreAppAlertInline>

			<div class="flex-1 min-h-0 overflow-hidden">
				<div v-if="!resolvedClientId" class="h-full bg-(--color-background) rounded-xl">
					<CoreAppEmptyState :icon="icons.log" :message="String($t('clients.logs.select'))" />
				</div>
				<div v-else-if="!selectedLogTypeValue" class="h-full bg-(--color-background) rounded-xl">
					<CoreAppEmptyState :icon="icons.log" :message="String($t('logs.selectType'))" />
				</div>
				<div v-else-if="loading && logContent.length === 0"
					class="flex items-center justify-center h-full gap-2 text-muted">
					<CoreAppLoadingSpinner />
				</div>
				<CoreAppAlertInline v-else-if="error" color="error" :title="String($t('common.error'))"
					:description="error" class="m-3" close @close="error = null" />
				<div v-else-if="logContent.length === 0" class="h-full bg-(--color-background) rounded-xl">
					<CoreAppEmptyState :icon="icons.log" :message="String($t('logs.none'))" />
				</div>
				<div v-else ref="logContainerRef"
					class="h-full overflow-auto log-viewer bg-(--color-background) rounded-xl font-mono text-xs">
					<div v-for="(line, idx) in filteredLogContent" :id="'logrow-' + idx" :key="idx" v-clickable
						:class="[getLogRowClass(line, idx), 'flex items-start hover:bg-(--color-surface-hover) cursor-pointer transition-colors group']"
						role="button" tabindex="0" @click="setMarker(idx)" @keydown.enter="setMarker(idx)"
						@keydown.space.prevent="setMarker(idx)">
						<span
							class="w-12 shrink-0 px-2 py-1.5 text-right text-(--color-text-muted) border-r border-(--color-border) select-none sticky left-0 bg-inherit">
							{{ idx + 1 }}
						</span>
						<span class="w-5 shrink-0 flex items-center justify-center py-1.5">
							<CoreAppIcon v-if="markerLine === idx" :name="icons.bookmark"
								class="w-3 h-3 text-opsi-blue" />
						</span>
						<code class="flex-1 px-2 py-1.5 whitespace-pre-wrap break-all leading-relaxed min-h-6">{{ line
						}}</code>
					</div>
				</div>
			</div>
		</div>
	</LayoutsPageLayout>
</template>

<script setup lang="ts">
import { useMessageBusStore } from '~/stores/messageBusStore'

export interface ClientsLogsRef {
	fetchLog?: () => Promise<void>
	selectedLogType?: Ref<{ label: string; value: string } | undefined>
}

interface Props {
	clientId?: string | null
	panelMode?: boolean
	showClientSelector?: boolean
	clientSelectorPlaceholder?: string
}

const props = withDefaults(defineProps<Props>(), {
	clientId: null,
	panelMode: false,
	showClientSelector: false,
	clientSelectorPlaceholder: undefined,
})

const emit = defineEmits<{
	'update:clientId': [value: string | null]
}>()

const icons = useIcons()
const { t: $t } = useI18n()
const route = useRoute()
const router = useRouter()
const { getClientLogs } = useApiHelpers()
const mbStore = useMessageBusStore()

interface LogType {
	label: string
	value: string
}

const LOG_TYPES: LogType[] = [
	{ label: 'instlog', value: 'instlog' },
	{ label: 'clientconnect', value: 'clientconnect' },
	{ label: 'userlogin', value: 'userlogin' },
	{ label: 'bootimage', value: 'bootimage' },
	{ label: 'opsiconfd', value: 'opsiconfd' },
]

const LOG_LEVEL_LABELS: Record<number, string> = {
	1: 'essential', 2: 'critical', 3: 'error',
	4: 'warning', 5: 'notice', 6: 'info',
	7: 'debug', 8: 'trace', 9: 'secret'
}

const LOG_COLORS = [
	'text-opsi-log-essential',
	'text-opsi-log-critical',
	'text-opsi-log-error',
	'text-opsi-log-warning',
	'text-opsi-log-notice',
	'text-opsi-log-info',
	'text-opsi-log-debug',
	'text-opsi-log-trace',
	'text-opsi-log-secret',
]

const clientSelectorModel = ref<string>(props.clientId || '')

watch(() => props.clientId, (v) => {
	if (v !== clientSelectorModel.value) clientSelectorModel.value = v || ''
}, { immediate: true })

watch(clientSelectorModel, (v) => {
	emit('update:clientId', v || null)
})

const resolvedClientId = computed<string | null>(() => {
	if (props.clientId) return props.clientId
	if (props.showClientSelector) return clientSelectorModel.value || null
	return null
})

const selectedLogTypeValue = ref<string>('')
const selectedLogType = computed<LogType | undefined>(
	() => LOG_TYPES.find(t => t.value === selectedLogTypeValue.value)
)
const logContent = ref<string[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const logLevel = ref(6)
const filterQuery = ref('')
const autoRefresh = ref(false)
const autoScroll = ref(true)
const markerLine = ref(-1)

const logUpdatePending = ref(false)

const logContainerRef = ref<HTMLElement | null>(null)
const hasMarker = computed(() => markerLine.value >= 0)

const filteredLogContent = computed(() => {
	return logContent.value.filter(line => {
		if (!isLogLevelVisible(line)) return false
		if (filterQuery.value && !line.toLowerCase().includes(filterQuery.value.toLowerCase())) return false
		return true
	})
})

function getLogLevel(line: string): number {
	const match = line.match(/^\[(\d)\]/)
	return match && match[1] ? parseInt(match[1], 10) : 6
}

function isLogLevelVisible(line: string): boolean {
	return getLogLevel(line) <= logLevel.value
}

function getLogRowClass(line: string, idx: number): string {
	const classes: string[] = []
	const level = getLogLevel(line)

	// Arrays are 0-based while log levels are 1-based. Clamp level to available range.
	const safeLevel = Math.min(Math.max(level, 1), LOG_COLORS.length)
	const colorClass = LOG_COLORS[safeLevel - 1]
	if (colorClass) classes.push(colorClass)
	if (markerLine.value === idx) classes.push('log-row-marker')

	return classes.join(' ')
}

function setMarker(idx: number) {
	markerLine.value = markerLine.value === idx ? -1 : idx
}

function clearMarker() {
	markerLine.value = -1
}

function scrollToMarker() {
	if (markerLine.value < 0) return
	document.getElementById('logrow-' + markerLine.value)
		?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function scrollToBottom() {
	if (logContainerRef.value) {
		logContainerRef.value.scrollTop = logContainerRef.value.scrollHeight
	}
}

async function fetchLog() {
	if (!selectedLogType.value?.value || !resolvedClientId.value) return

	loading.value = true
	error.value = null

	try {
		const result = await getClientLogs(resolvedClientId.value, selectedLogType.value.value)

		if (result.error) throw result.error

		const data = result.data
		if (Array.isArray(data)) {
			logContent.value = data
		} else if (data && typeof data === 'object' && 'result' in data) {
			logContent.value = (data as { result: string[] }).result
		} else {
			logContent.value = []
		}

		if (autoScroll.value && !hasMarker.value) {
			await nextTick()
			scrollToBottom()
		}
	} catch (e) {
		error.value = e instanceof Error ? e.message : String(e)
		logContent.value = []
	} finally {
		loading.value = false
	}
}

async function dismissAndFetch() {
	logUpdatePending.value = false
	await fetchLog()
}

function downloadLog() {
	const fileName = `${resolvedClientId.value}_${selectedLogType.value?.value || 'log'}.log`
	const content = filteredLogContent.value.join('\n')
	const blob = new Blob([content], { type: 'text/plain' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = fileName
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	URL.revokeObjectURL(url)
}

function refresh() {
	fetchLog()
}

watch(selectedLogTypeValue, (newVal, oldVal) => {
	if (!newVal || newVal === oldVal) return
	logContent.value = []
	error.value = null
	markerLine.value = -1
	logUpdatePending.value = false
	fetchLog()
})

watch(() => resolvedClientId.value, () => {
	logContent.value = []
	error.value = null
	markerLine.value = -1
	logUpdatePending.value = false
	if (selectedLogTypeValue.value) {
		fetchLog()
	}
})

let autoRefreshInterval: ReturnType<typeof setInterval> | null = null

watch(autoRefresh, (enabled) => {
	if (autoRefreshInterval) { clearInterval(autoRefreshInterval); autoRefreshInterval = null }
	if (enabled) {
		autoRefreshInterval = setInterval(() => {
			if (selectedLogTypeValue.value && resolvedClientId.value) fetchLog()
		}, 5000)
	}
})

watch(
	() => mbStore.lastMsg as Record<string, unknown> | null | undefined,
	(msg) => {
		if (!msg) return
		const channel = (msg as { channel?: string }).channel
		const data = (msg as { data?: { type?: string; object_id?: string } }).data
		if (
			channel === 'event:log_updated' &&
			data?.type === selectedLogType.value?.value &&
			data?.object_id === resolvedClientId.value
		) {
			if (autoRefresh.value) {
				fetchLog()
			} else {
				logUpdatePending.value = true
			}
		}
	}
)

const { mount: mbMount } = useMessageBus(undefined, false, ['event:log_updated'])

onMounted(() => {
	mbMount()

	// Restore log type and level from URL when not in panel mode
	if (!props.panelMode) {
		const qLogType = route.query.logType as string | undefined
		const qLogLevel = route.query.logLevel as string | undefined
		if (qLogType && LOG_TYPES.some(t => t.value === qLogType)) {
			selectedLogTypeValue.value = qLogType
		}
		if (qLogLevel) {
			const parsed = parseInt(qLogLevel, 10)
			if (parsed >= 1 && parsed <= 9) logLevel.value = parsed
		}
	}
})

// Sync log type and level to URL when not in panel mode
if (!props.panelMode) {
	watch(selectedLogTypeValue, (v) => {
		if (v) router.replace({ query: { ...route.query as Record<string, string>, logType: v } })
	})
	watch(logLevel, (v) => {
		router.replace({ query: { ...route.query as Record<string, string>, logLevel: String(v) } })
	})
}

onUnmounted(() => {
	if (autoRefreshInterval) clearInterval(autoRefreshInterval)
})

defineExpose({ fetchLog, selectedLogType, selectedLogTypeValue, refresh })
</script>
