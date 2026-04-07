ClientsLogsView - displays various logs for a selected client with filtering,
log level control, auto-refresh, auto-scroll, marker, download and messagebus integration.
Can be used both in standalone pages and detail panels.
<template>
	<LayoutsPageLayout :loading="loading">
		<template #filters>
			<slot name="clientSelector">
				<HostsSelector v-if="showClientSelector" v-model="clientSelectorModel" type="client"
					:placeholder="clientSelectorPlaceholder || String($t('selectClient'))" :allow-all="false"
					allow-clear />

			</slot>
			<USelectMenu v-model="selectedLogTypeValue" :placeholder="$t('selectLogType')" :items="LOG_TYPES"
				:loading="loading" value-key="value" label-key="label" class="min-w-30" size="sm" />
			<div v-if="logContent.length > 0" class="flex flex-col gap-1 w-30">
				<label class="text-xs font-medium text-muted">
					{{ $t('logLevel') }}: <span class="font-semibold text-opsi-blue">{{ logLevel }}</span>
					<span class="ml-1 text-muted">({{ LOG_LEVEL_LABELS[logLevel] }})</span>
				</label>
				<input v-model.number="logLevel" type="range" min="1" max="9" step="1"
					class="opsi-log-level-slider w-full h-2 rounded-full appearance-none cursor-pointer" />
			</div>
		</template>
		<template #actions>
			<div v-if="resolvedClientId" class="flex gap-2">
				<div v-if="logContent.length > 0">
					<SharedFilterInput v-model="filterQuery" size="sm" input-class="w-full sm:w-40 md:w-64" />
				</div>
				<div v-if="logContent.length > 0">
					<UTooltip :text="$t('autoRefreshDescription')">
						<UButton :color="autoRefresh ? 'primary' : 'neutral'" :variant="autoRefresh ? 'solid' : 'ghost'"
							size="sm" @click="autoRefresh = !autoRefresh">
							<span class="hidden sm:inline text-xs">{{ $t('autoRefresh') }}</span>
						</UButton>
					</UTooltip>
				</div>
				<div v-if="logContent.length > 0">
					<UTooltip :text="$t('autoScrollDescription')">
						<UButton :color="autoScroll ? 'primary' : 'neutral'"
							:variant="autoScroll && !hasMarker ? 'solid' : 'ghost'" :disabled="hasMarker" size="sm"
							@click="autoScroll = !autoScroll">
							<span class="hidden sm:inline text-xs">{{ $t('autoScroll') }}</span>
						</UButton>
					</UTooltip>
				</div>
				<div v-if="hasMarker" class="flex items-center gap-1">
					<UTooltip :text="$t('scrollToMarker')">
						<UButton :icon="icons.bookmark" variant="ghost" color="primary" size="sm"
							@click="scrollToMarker" />
					</UTooltip>
					<UTooltip :text="$t('clearMarker')">
						<UButton :icon="icons.x" variant="ghost" color="neutral" size="sm" @click="clearMarker" />
					</UTooltip>
				</div>

				<div v-if="selectedLogTypeValue">
					<UTooltip :text="$t('download')">
						<UButton :icon="icons.download" variant="ghost" color="neutral" size="sm"
							:disabled="filteredLogContent.length === 0" @click="downloadLog" />
					</UTooltip>
				</div>

				<div v-if="selectedLogTypeValue">
					<UTooltip :text="$t('refresh')">
						<UButton :icon="icons.refresh" variant="ghost" color="neutral" size="sm" :loading="loading"
							@click="fetchLog" />
					</UTooltip>
				</div>
			</div>
		</template>

		<div class="flex flex-col h-full gap-2 min-h-0">
			<div v-if="logContent.length > 0 && hasMarker"
				class="flex items-center gap-6 text-xs text-muted shrink-0 px-3">
				<span class="flex items-center gap-1 text-opsi-blue font-medium">
					<UIcon :name="icons.bookmark" class="w-3 h-3" />
					{{ $t('marker') }}: {{ markerLine + 1 }}
				</span>
			</div>

			<SharedAlertInline v-if="logUpdatePending" color="info" :title="$t('opsiMessageBus')"
				:description="$t('opsiMessageBus.log_updated')" class="shrink-0">
				<template #actions>
					<UButton size="xs" color="primary" @click="dismissAndFetch">{{ $t('button.reload') }}</UButton>
					<UButton size="xs" variant="ghost" color="neutral" @click="logUpdatePending = false">{{
						$t('dismiss') }}
					</UButton>
				</template>
			</SharedAlertInline>

			<div class="flex-1 min-h-0 overflow-hidden">
				<div v-if="!resolvedClientId"
					class="flex flex-col items-center justify-center h-full text-center bg-[--color-surface] rounded-xl">
					<UIcon :name="icons.log" class="w-12 h-12 mb-3 opacity-40 text-muted" />
					<p class="text-muted text-sm">{{ $t('selectClientToViewLogs') }}</p>
				</div>
				<div v-else-if="!selectedLogTypeValue"
					class="flex flex-col items-center justify-center h-full gap-3 text-center bg-[--color-surface] rounded-xl">
					<UIcon :name="icons.log" class="w-12 h-12 opacity-40 text-muted" />
					<p class="text-sm text-muted">{{ $t('selectLogTypeToView') }}</p>
				</div>
				<div v-else-if="loading && logContent.length === 0"
					class="flex items-center justify-center h-full gap-2 text-muted">
					<SharedLoadingSpinner />
				</div>
				<SharedAlertInline v-else-if="error" color="error" :title="String($t('error'))" :description="error"
					class="m-3" close @close="error = null" />
				<div v-else-if="logContent.length === 0"
					class="flex flex-col items-center justify-center h-full gap-3 text-center bg-[--color-surface] rounded-xl">
					<UIcon :name="icons.log" class="w-12 h-12 opacity-40 text-muted" />
					<p class="text-sm text-muted">{{ $t('noLogsFound') }}</p>
				</div>
				<div v-else ref="logContainerRef"
					class="h-full overflow-auto log-viewer bg-[--color-surface] rounded-xl font-mono text-xs">
					<div v-for="(line, idx) in filteredLogContent" :id="'logrow-' + idx" :key="idx"
						:class="[getLogRowClass(line, idx), 'flex items-start hover:bg-[--color-surface-hover] cursor-pointer transition-colors group']"
						@click="setMarker(idx)">
						<span
							class="w-12 shrink-0 px-2 py-1.5 text-right text-[--color-text-muted] border-r border-[--color-border] select-none sticky left-0 bg-inherit">
							{{ idx + 1 }}
						</span>
						<span class="w-5 shrink-0 flex items-center justify-center py-1.5">
							<UIcon v-if="markerLine === idx" :name="icons.bookmark" class="w-3 h-3 text-opsi-blue" />
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
import { useUiStore } from '~/stores/uiStore'
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
const { apiGet } = useApiHelpers()
const uiStore = useUiStore()
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

const LOG_COLORS_LIGHT = [
	'text-opsi-log-light-essential',
	'text-opsi-log-light-critical',
	'text-opsi-log-light-error',
	'text-opsi-log-light-warning',
	'text-opsi-log-light-notice',
	'text-opsi-log-light-info',
	'text-opsi-log-light-debug',
	'text-opsi-log-light-trace',
	'text-opsi-log-light-secret',
]

const LOG_COLORS_DARK = [
	'text-opsi-log-dark-essential',
	'text-opsi-log-dark-critical',
	'text-opsi-log-dark-error',
	'text-opsi-log-dark-warning',
	'text-opsi-log-dark-notice',
	'text-opsi-log-dark-info',
	'text-opsi-log-dark-debug',
	'text-opsi-log-dark-trace',
	'text-opsi-log-dark-secret',
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
const isDarkMode = computed(() => uiStore.theme === 'dark')
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
	const maxLevels = Math.max(LOG_COLORS_LIGHT.length, LOG_COLORS_DARK.length)
	const safeLevel = Math.min(Math.max(level, 1), maxLevels)
	const colorClass = isDarkMode.value ? LOG_COLORS_DARK[safeLevel - 1] : LOG_COLORS_LIGHT[safeLevel - 1]
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
		const result = await apiGet<{ result: string[] } | string[]>('/opsidata/log', {
			selectedClient: resolvedClientId.value,
			selectedLogType: selectedLogType.value.value,
		})

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
	selectedLogTypeValue.value = ''
	logContent.value = []
	error.value = null
	markerLine.value = -1
	logUpdatePending.value = false
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
})

onUnmounted(() => {
	if (autoRefreshInterval) clearInterval(autoRefreshInterval)
})

defineExpose({ fetchLog, selectedLogType, selectedLogTypeValue, refresh })
</script>
