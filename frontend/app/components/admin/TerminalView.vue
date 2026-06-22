<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  AdminTerminalView - Server terminal access via messagebus with xterm.js integration.
-->
<template>
    <div class="h-full flex flex-col gap-3">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
            <div class="flex items-center gap-3">
                <CoreAppButton v-if="!isConnected" color="primary" size="sm" :icon="icons.checkCircle"
                    :loading="isConnecting" :disabled="isDisabled" @click="connect">{{ $t('terminal.connect') }}
                </CoreAppButton>
                <CoreAppButton v-else color="error" variant="outline" size="sm" :icon="icons.x" @click="disconnect">{{
                    $t('terminal.disconnect') }}</CoreAppButton>
                <span v-if="isConnected" class="flex items-center gap-1 text-sm text-(--color-success-soft-text)">
                    <CoreAppIcon :name="icons.checkCircle" class="w-6 h-6 text-(--color-success)" />
                    {{ $t('terminal.connected') }}
                </span>
                <span v-else class="flex items-center gap-1 text-sm text-(--color-text-muted)"><span
                        class="w-2 h-2 rounded-full bg-(--color-text-muted)"></span>{{ $t('terminal.disconnected') }}</span>
            </div>
            <CoreAppButton variant="ghost" color="neutral" size="sm" :icon="icons.config"
                @click="showSettings = !showSettings">{{ $t('common.settings') }}</CoreAppButton>
        </div>

        <div v-if="showSettings" class="shrink-0 p-3 rounded-lg">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CoreAppFormField :label="$t('terminal.id')">
                    <CoreAppInput v-model="terminalId" :disabled="isConnected" size="sm" class="w-full" />
                </CoreAppFormField>
                <CoreAppFormField :label="$t('terminal.channel')">
                    <CoreAppInput v-model="terminalChannel" :disabled="isConnected" size="sm" class="w-full" />
                </CoreAppFormField>
            </div>
        </div>

        <CoreAppAlertInline v-if="isDisabled" color="warning" variant="soft" class="shrink-0">
            <template #title>{{ $t('terminal.disabled') }}</template>
        </CoreAppAlertInline>

        <div v-if="!isDisabled" class="flex-1 min-h-0 rounded-lg overflow-hidden border border-(--color-border)">
            <div ref="terminalContainer" class="h-full w-full bg-gray-900" />
        </div>
    </div>
</template>

<script setup lang="ts">
const icons = useIcons()
const { t: $t } = useI18n()
const { isReadOnly, isTerminalEnabled } = useUserPermissions()
const { fetchDisabledFeatures } = useCachedData()

const terminalContainer = ref<HTMLElement | null>(null)
const isDisabled = ref(false)
const isConnecting = ref(false)
const isConnected = ref(false)
const showSettings = ref(false)
const terminalInstance = ref<{
    terminal: ReturnType<typeof createTerminalInterface>
    fitAddon: { fit: () => void }
} | null>(null)

const terminalIdDefault = crypto.randomUUID()
const terminalChannelDefault = 'service:config:terminal'
const terminalId = ref(terminalIdDefault)
const terminalChannel = ref(terminalChannelDefault)
const terminalSessionChannel = ref('')

const messageBus = useMessageBus(handleMessage, false)

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

async function checkDisabled() {
    if (isReadOnly.value || !isTerminalEnabled.value) {
        isDisabled.value = true
        return
    }
    const data = await fetchDisabledFeatures()
    if (data) isDisabled.value = data.includes('terminal')
}

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

        const handleResize = () => fitAddon.fit()
        window.addEventListener('resize', handleResize)

        terminal.writeln('\x1b[1;34m╔════════════════════════════════════════╗\x1b[0m')
        terminal.writeln(`\x1b[1;34m║     ${$t('terminal.title').toString().padEnd(35)}║\x1b[0m`)
        terminal.writeln('\x1b[1;34m╚════════════════════════════════════════╝\x1b[0m')
        terminal.writeln('')
        terminal.writeln(`${$t('terminal.press')}`)
        terminal.writeln('')

        return () => {
            window.removeEventListener('resize', handleResize)
            terminal.dispose()
        }
    } catch (e) {
        // Terminal init failed silently
    }
}

async function connect() {
    if (!terminalInstance.value) return

    isConnecting.value = true

    try {
        const terminal = terminalInstance.value.terminal
        await messageBus.mount()
        terminal.clear()
        terminal.writeln(`\x1b[1;33m${$t('terminal.connecting')}\x1b[0m`)
        terminalSessionChannel.value = 'session:' + terminalId.value
        terminal.terminalSessionChannel = terminalSessionChannel.value
        await messageBus.wsTerminalOpen(terminalId.value, terminal)
        terminal.writeln(`\x1b[1;32m${$t('terminal.connected')}\x1b[0m`)
        terminal.writeln('')
        isConnected.value = true

        terminal.onData((data: string) => {
            if (!isConnected.value) return
            messageBus.wsTerminalSend(data, terminal)
        })

        let skipResizeEvent = true
        setTimeout(() => { skipResizeEvent = false }, 500)

        terminal.onResize((event: { rows: number; cols: number }) => {
            if (!skipResizeEvent && isConnected.value) {
                messageBus.wsTerminalResize(event.rows, event.cols, terminal)
            }
        })
    } catch (_e) {
        if (terminalInstance.value) {
            terminalInstance.value.terminal.writeln(`\x1b[1;31m${$t('terminal.failed')}\x1b[0m`)
        }
    } finally {
        isConnecting.value = false
    }
}

function disconnect() {
    if (terminalInstance.value && isConnected.value) {
        messageBus.wsTerminalClose(terminalInstance.value.terminal)
        terminalInstance.value.terminal.writeln('')
        terminalInstance.value.terminal.writeln(`\x1b[1;33m${$t('terminal.disconnected')}\x1b[0m`)
    }

    isConnected.value = false
    terminalId.value = crypto.randomUUID()
    terminalChannel.value = terminalChannelDefault
}

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
    } catch (_e) {
        // Unmount cleanup
    }
    if (terminalInstance.value) {
        try {
            terminalInstance.value.terminal.dispose()
        } catch (_e) {
            // Terminal dispose
        }
    }
})
</script>

<style>
.xterm {
    height: 100%;
    padding-bottom: 4px;
}

.xterm-viewport {
    overflow-y: auto !important;
}

.xterm-screen {
    padding-bottom: 1.5rem;
}
</style>
