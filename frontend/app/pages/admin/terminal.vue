<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0

Admin Terminal Page - Server terminal access via messagebus
-->
<template>
    <div class="h-full flex flex-col gap-3">
        <!-- Header with controls -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
            <div class="flex items-center gap-3">
                <UButton v-if="!isConnected" color="primary" size="sm" :icon="icons.check" :loading="isConnecting"
                    :disabled="isDisabled" @click="connect">{{ $t('connectOrReconnect') }}</UButton>
                <UButton v-else color="error" variant="outline" size="sm" :icon="icons.close" @click="disconnect">{{
                    $t('disconnect') }}</UButton>
                <span v-if="isConnected" class="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>{{ $t('connected') }}
                </span>
                <span v-else class="flex items-center gap-1 text-sm text-gray-500"><span
                        class="w-2 h-2 rounded-full bg-gray-400"></span>{{ $t('disconnected') }}</span>
            </div>
            <!-- Settings toggle -->
            <UButton variant="ghost" color="neutral" size="sm" :icon="icons.config"
                @click="showSettings = !showSettings">{{ $t('settings') }}</UButton>
        </div>

        <!-- Settings panel (collapsible) -->
        <div v-if="showSettings"
            class="shrink-0 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <UFormField :label="$t('terminalID')">
                    <UInput v-model="terminalId" :disabled="isConnected" size="sm" class="w-full" />
                </UFormField>
                <UFormField :label="$t('terminalChannel')">
                    <UInput v-model="terminalChannel" :disabled="isConnected" size="sm" class="w-full" />
                </UFormField>
            </div>
        </div>

        <!-- Disabled Warning -->
        <UAlert v-if="isDisabled" color="warning" variant="soft" class="shrink-0">
            <template #title>{{ $t('message.terminalDisabled') }}</template>
        </UAlert>

        <!-- Terminal Container (flex-grow to fill remaining space) -->
        <div v-if="!isDisabled" class="flex-1 min-h-0 rounded-lg overflow-hidden border border-[var(--color-border)]">
            <div ref="terminalContainer" class="h-full w-full bg-gray-900" />
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()
const api = useApiHelpers()

// Terminal state
const terminalContainer = ref<HTMLElement | null>(null)
const isDisabled = ref(false)
const isConnecting = ref(false)
const isConnected = ref(false)
const showSettings = ref(false)
const terminalInstance = ref<{
    terminal: ReturnType<typeof createTerminalInterface>
    fitAddon: { fit: () => void }
} | null>(null)

// Terminal config
const terminalIdDefault = crypto.randomUUID()
const terminalChannelDefault = 'service:config:terminal'
const terminalId = ref(terminalIdDefault)
const terminalChannel = ref(terminalChannelDefault)
const terminalSessionChannel = ref('')

// MessageBus
const messageBus = useMessageBus(handleMessage, false)

// Create a terminal interface type helper
function createTerminalInterface(t: unknown): {
    cols: number
    rows: number
    terminalId: string
    terminalChannel: string
    terminalSessionChannel: string
    writeln: (text: string) => void
    write: (data: string | Uint8Array) => void
    onData: (cb: (data: string) => void) => { dispose: () => void }
    onResize: (cb: (size: { rows: number; cols: number }) => void) => { dispose: () => void }
    clear: () => void
    dispose: () => void
} {
    return t as ReturnType<typeof createTerminalInterface>
}

// Check if terminal is disabled
async function checkDisabled() {
    const { data, error } = await api.getDisabledFeatures()
    if (!error && data) isDisabled.value = data.includes('terminal')
}

// Handle messagebus messages
async function handleMessage(msg: unknown) {
    if (!msg || typeof msg !== 'object') return
    const message = msg as { type?: string; cols?: number; rows?: number; data?: Uint8Array; back_channel?: string }

    if (!message.type?.startsWith('terminal_')) return
    if (!terminalInstance.value) return

    const terminal = terminalInstance.value.terminal

    if (message.type === 'terminal_open_event' || message.type === 'terminal_resize_event') {
        if (message.type === 'terminal_open_event' && message.back_channel) {
            terminalChannel.value = message.back_channel
            terminal.terminalChannel = message.back_channel
        }
        if (terminal.cols !== message.cols || terminal.rows !== message.rows) {
            terminalInstance.value.fitAddon.fit()
        }
    } else if (message.type === 'terminal_data_read' && message.data) {
        terminal.write(message.data)
    }
}

// Initialize terminal
async function initTerminal() {
    if (!terminalContainer.value || typeof window === 'undefined') return

    try {
        const { Terminal } = await import('@xterm/xterm')
        const { FitAddon } = await import('@xterm/addon-fit')
        const { SearchAddon } = await import('@xterm/addon-search')
        const { WebLinksAddon } = await import('@xterm/addon-web-links')
        await import('@xterm/xterm/css/xterm.css')

        const terminal = new Terminal({
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            convertEol: true,
            disableStdin: false,
            cursorBlink: true,
            scrollback: 1000,
            theme: {
                background: '#111827',
                foreground: '#e5e7eb',
                cursor: '#10b981',
                cursorAccent: '#111827',
                selectionBackground: '#374151',
                black: '#111827',
                red: '#ef4444',
                green: '#10b981',
                yellow: '#f59e0b',
                blue: '#3b82f6',
                magenta: '#8b5cf6',
                cyan: '#06b6d4',
                white: '#e5e7eb',
            },
        })

        const fitAddon = new FitAddon()
        terminal.loadAddon(fitAddon)
        terminal.loadAddon(new SearchAddon())
        terminal.loadAddon(new WebLinksAddon())

        terminal.open(terminalContainer.value)
        fitAddon.fit()

        // Enhance terminal object with our properties
        const enhancedTerminal = terminal as typeof terminal & {
            terminalId: string
            terminalChannel: string
            terminalSessionChannel: string
        }
        enhancedTerminal.terminalId = terminalId.value
        enhancedTerminal.terminalChannel = terminalChannel.value
        enhancedTerminal.terminalSessionChannel = ''

        terminalInstance.value = {
            terminal: createTerminalInterface(enhancedTerminal),
            fitAddon,
        }

        // Handle resize
        const handleResize = () => fitAddon.fit()
        window.addEventListener('resize', handleResize)

        // Welcome message
        terminal.writeln('\x1b[1;34m╔════════════════════════════════════════╗\x1b[0m')
        terminal.writeln('\x1b[1;34m║     OPSI Server Terminal               ║\x1b[0m')
        terminal.writeln('\x1b[1;34m╚════════════════════════════════════════╝\x1b[0m')
        terminal.writeln('')
        terminal.writeln('Press \x1b[1;32mConnect\x1b[0m to start a session...')
        terminal.writeln('')

        return () => {
            window.removeEventListener('resize', handleResize)
            terminal.dispose()
        }
    } catch (e) {
        console.error('Failed to initialize terminal:', e)
    }
}

// Connect to terminal via messagebus
async function connect() {
    if (!terminalInstance.value) return

    isConnecting.value = true

    try {
        const terminal = terminalInstance.value.terminal

        // Initialize messagebus
        await messageBus.mount()

        terminal.clear()
        terminal.writeln('\x1b[1;33mConnecting to server...\x1b[0m')

        // Set session channel
        terminalSessionChannel.value = 'session:' + terminalId.value
        terminal.terminalSessionChannel = terminalSessionChannel.value

        // Open terminal via messagebus
        await messageBus.wsTerminalOpen(terminalId.value, terminal)

        terminal.writeln('\x1b[1;32mConnected!\x1b[0m')
        terminal.writeln('')

        isConnected.value = true

        // Handle terminal input
        terminal.onData((data: string) => {
            if (!isConnected.value) return
            messageBus.wsTerminalSend(data, terminal)
        })

        // Handle terminal resize
        let skipResizeEvent = true
        setTimeout(() => { skipResizeEvent = false }, 500)

        terminal.onResize((event: { rows: number; cols: number }) => {
            if (!skipResizeEvent && isConnected.value) {
                messageBus.wsTerminalResize(event.rows, event.cols, terminal)
            }
        })
    } catch (e) {
        console.error('Failed to connect:', e)
        if (terminalInstance.value) {
            terminalInstance.value.terminal.writeln('\x1b[1;31mConnection failed!\x1b[0m')
        }
    } finally {
        isConnecting.value = false
    }
}

// Disconnect terminal
function disconnect() {
    if (terminalInstance.value && isConnected.value) {
        messageBus.wsTerminalClose(terminalInstance.value.terminal)
        terminalInstance.value.terminal.writeln('')
        terminalInstance.value.terminal.writeln('\x1b[1;33mDisconnected\x1b[0m')
    }

    isConnected.value = false
    terminalId.value = crypto.randomUUID()
    terminalChannel.value = terminalChannelDefault
}

// Lifecycle
onMounted(async () => {
    await checkDisabled()
    if (!isDisabled.value) {
        await nextTick()
        await initTerminal()
    }
})

onUnmounted(() => {
    try {
        disconnect()
    } catch (e) {
        console.warn('Unmount cleanup error:', e)
    }
    if (terminalInstance.value) {
        try {
            terminalInstance.value.terminal.dispose()
        } catch (e) {
            console.warn('Terminal dispose error:', e)
        }
    }
})
</script>

<style>
.xterm {
    height: 100%;
}

.xterm-viewport {
    overflow-y: auto !important;
}
</style>
