<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Client Logs component - displays various logs for a given client with filtering,
log level control, auto-fetch, auto-scroll, and download options.
-->
<template>
    <div class="flex flex-col h-full gap-3">
        <!-- Log Controls Header -->
        <div class="flex flex-wrap items-end gap-3 shrink-0">
            <!-- Log Type Selector -->
            <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-muted">{{ $t('logType') }}</label>
                <USelectMenu v-model="selectedLogType" :items="LOG_TYPES" :loading="loading" class="w-44" />
            </div>

            <!-- Log Level Slider -->
            <div v-if="logContent.length > 0" class="flex flex-col gap-1 min-w-32">
                <label class="text-xs font-medium text-muted">{{ $t('logLevel') }}: {{ logLevel }}</label>
                <input type="range" v-model.number="logLevel" min="0" max="9" step="1"
                    class="w-full h-2 bg-[--color-surface] rounded-lg appearance-none cursor-pointer accent-opsi-blue" />
            </div>

            <!-- Filter Input -->
            <div v-if="logContent.length > 0" class="flex flex-col gap-1 flex-1 min-w-40">
                <label class="text-xs font-medium text-muted">{{ $t('filter') }}</label>
                <UInput v-model="filterQuery" :placeholder="$t('typeToFilter')" size="sm" clearable
                    :icon="icons.search" />
            </div>

            <!-- Control Toggles -->
            <div v-if="logContent.length > 0" class="flex items-center gap-3">
                <div class="flex items-center gap-1.5">
                    <UToggle v-model="autoFetch" size="xs" />
                    <span class="text-xs text-muted">{{ $t('autoFetch') }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                    <UToggle v-model="autoScroll" size="xs" :disabled="hasMarker" />
                    <span class="text-xs text-muted">{{ $t('autoScroll') }}</span>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-1">
                <UTooltip v-if="hasMarker" :text="$t('scrollToMarker')">
                    <UButton :icon="icons.bookmark" variant="ghost" color="neutral" size="xs" @click="scrollToMarker" />
                </UTooltip>
                <UTooltip v-if="hasMarker" :text="$t('clearMarker')">
                    <UButton :icon="icons.close" variant="ghost" color="neutral" size="xs" @click="clearMarker" />
                </UTooltip>
                <UTooltip :text="$t('refresh')">
                    <UButton :icon="icons.refresh" variant="ghost" color="neutral" size="xs" :loading="loading"
                        @click="fetchLog" />
                </UTooltip>
                <UTooltip :text="$t('download')">
                    <UButton :icon="icons.download" variant="ghost" color="neutral" size="xs"
                        :disabled="filteredLogContent.length === 0" @click="downloadLog" />
                </UTooltip>
            </div>
        </div>

        <!-- Log Stats -->
        <div v-if="logContent.length > 0" class="flex items-center gap-4 text-xs text-muted shrink-0">
            <span>{{ $t('totalLines') }}: {{ logContent.length }}</span>
            <span>{{ $t('visible') }}: {{ filteredLogContent.length }}</span>
            <span v-if="hasMarker">{{ $t('marker') }}: {{ markerLine + 1 }}</span>
        </div>

        <!-- Log Content -->
        <div class="flex-1 min-h-0 overflow-hidden">
            <div v-if="!selectedLogType" class="flex items-center justify-center h-full text-muted">
                <p class="text-sm">{{ $t('selectLogTypeToView') }}</p>
            </div>

            <div v-else-if="loading" class="flex items-center justify-center h-full">
                <UIcon :name="icons.loading" class="w-6 h-6 animate-spin text-opsi-blue" />
            </div>

            <div v-else-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
            </div>

            <div v-else-if="logContent.length === 0"
                class="flex items-center justify-center h-full text-muted border border-[--color-border] rounded-lg">
                <p class="text-sm">{{ $t('noLogsFound') }}</p>
            </div>

            <div v-else ref="logContainerRef"
                class="h-full overflow-auto log-viewer bg-[--color-surface] rounded-lg border border-[--color-border] font-mono text-xs">
                <div v-for="(line, idx) in filteredLogContent" :key="idx" :id="'logrow-' + idx"
                    :class="getLogRowClass(line, idx)"
                    class="flex items-start hover:bg-[--color-surface-hover] cursor-pointer transition-colors"
                    @click="setMarker(idx)">
                    <span
                        class="w-12 shrink-0 px-2 py-0.5 text-right text-[--color-text-muted] border-r border-[--color-border] select-none sticky left-0 bg-inherit">
                        {{ idx + 1 }}
                    </span>
                    <UIcon v-if="markerLine === idx" :name="icons.bookmark"
                        class="w-3 h-3 mx-1 mt-0.5 text-opsi-blue shrink-0" />
                    <code class="flex-1 px-2 py-0.5 whitespace-pre-wrap break-all">{{ line }}</code>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/uiStore'

const props = defineProps<{
    clientId: string
}>()

const icons = useIcons()
const { t: $t } = useI18n()
const { apiGet } = useApiHelpers()
const uiStore = useUiStore()

interface LogType {
    label: string
    value: string
    description: string
}

const LOG_TYPES: LogType[] = [
    { label: 'instlog', value: 'instlog', description: 'Installation log' },
    { label: 'clientconnect', value: 'clientconnect', description: 'Client connect log' },
    { label: 'userlogin', value: 'userlogin', description: 'User login log' },
    { label: 'bootimage', value: 'bootimage', description: 'Boot image log' },
    { label: 'opsiconfd', value: 'opsiconfd', description: 'Opsiconfd log' },
]

// Log level color mappings (per OPSI corporate design)
const LOG_COLORS_LIGHT = [
    '', // 0 - not used
    'text-opsi-log-light-essential', // 1
    'text-opsi-log-light-critical',  // 2
    'text-opsi-log-light-error',     // 3
    'text-opsi-log-light-warning',   // 4
    'text-opsi-log-light-notice',    // 5
    'text-opsi-log-light-info',      // 6
    'text-opsi-log-light-debug',     // 7
    'text-opsi-log-light-trace',     // 8
    'text-opsi-log-light-secret',    // 9
]

const LOG_COLORS_DARK = [
    '', // 0 - not used
    'text-opsi-log-dark-essential', // 1
    'text-opsi-log-dark-critical',  // 2
    'text-opsi-log-dark-error',     // 3
    'text-opsi-log-dark-warning',   // 4
    'text-opsi-log-dark-notice',    // 5
    'text-opsi-log-dark-info',      // 6
    'text-opsi-log-dark-debug',     // 7
    'text-opsi-log-dark-trace',     // 8
    'text-opsi-log-dark-secret',    // 9
]

const selectedLogType = ref<LogType | undefined>(undefined)
const logContent = ref<string[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// User preferences
const logLevel = ref(6 as number) // Default to INFO level
const filterQuery = ref('')
const autoFetch = ref(false)
const autoScroll = ref(true)
const markerLine = ref(-1)

const logContainerRef = ref<HTMLElement | null>(null)

const isDarkMode = computed(() => uiStore.theme === 'dark')
const hasMarker = computed(() => markerLine.value >= 0)

// Filter log content by level and query
const filteredLogContent = computed(() => {
    return logContent.value.filter(line => {
        // Filter by log level
        if (!isLogLevelVisible(line)) return false
        // Filter by search query
        if (filterQuery.value && !line.toLowerCase().includes(filterQuery.value.toLowerCase())) return false
        return true
    })
})

// Extract log level from line (format: [N] ...)
function getLogLevel(line: string): number {
    const match = line.match(/^\[(\d)\]/)
    return match && match[1] ? parseInt(match[1], 10) : 6 // Default to INFO
}

// Check if log level should be visible
function isLogLevelVisible(line: string): boolean {
    const level = getLogLevel(line)
    return level <= logLevel.value
}

// Get CSS class for log row based on level
function getLogRowClass(line: string, idx: number): string {
    const classes: string[] = []
    const level = getLogLevel(line)

    // Add color class based on level
    const colorClass = isDarkMode.value ? LOG_COLORS_DARK[level] : LOG_COLORS_LIGHT[level]
    if (colorClass) classes.push(colorClass)

    // Add marker highlight
    if (markerLine.value === idx) {
        classes.push('log-row-marker')
    }

    return classes.join(' ')
}

// Set marker on line
function setMarker(idx: number) {
    if (markerLine.value === idx) {
        markerLine.value = -1
    } else {
        markerLine.value = idx
    }
}

// Clear marker
function clearMarker() {
    markerLine.value = -1
}

// Scroll to marker
function scrollToMarker() {
    if (markerLine.value < 0) return
    const el = document.getElementById('logrow-' + markerLine.value)
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
}

// Fetch log from API
async function fetchLog() {
    if (!selectedLogType.value) return

    loading.value = true
    error.value = null

    try {
        const result = await apiGet<{ result: string[] } | string[]>('/opsidata/log', {
            selectedClient: props.clientId,
            selectedLogType: selectedLogType.value.value,
        })

        if (result.error) {
            throw result.error
        }

        // Handle both response formats
        const data = result.data
        if (Array.isArray(data)) {
            logContent.value = data
        } else if (data && typeof data === 'object' && 'result' in data) {
            logContent.value = (data as { result: string[] }).result
        } else {
            logContent.value = []
        }

        // Auto-scroll to bottom if enabled
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

// Scroll to bottom of log
function scrollToBottom() {
    if (logContainerRef.value) {
        logContainerRef.value.scrollTop = logContainerRef.value.scrollHeight
    }
}

// Download current filtered log
function downloadLog() {
    const fileName = `${props.clientId}_${selectedLogType.value?.value || 'log'}.log`
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

// Watch for log type changes
watch(selectedLogType, () => {
    logContent.value = []
    error.value = null
    markerLine.value = -1
    fetchLog()
})

// Watch for client ID changes
watch(() => props.clientId, () => {
    selectedLogType.value = undefined
    logContent.value = []
    error.value = null
    markerLine.value = -1
})

// Auto-fetch interval
let autoFetchInterval: ReturnType<typeof setInterval> | null = null

watch(autoFetch, (enabled) => {
    if (autoFetchInterval) {
        clearInterval(autoFetchInterval)
        autoFetchInterval = null
    }
    if (enabled) {
        autoFetchInterval = setInterval(() => {
            if (selectedLogType.value) {
                fetchLog()
            }
        }, 5000) // Fetch every 5 seconds
    }
})

onUnmounted(() => {
    if (autoFetchInterval) {
        clearInterval(autoFetchInterval)
    }
})
</script>
