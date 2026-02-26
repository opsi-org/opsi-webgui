<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <div class="space-y-4">
        <UCard class="h-[calc(100vh-16rem)]">
            <div class="h-full flex flex-col">
                <div class="flex-1 bg-gray-900 text-green-400 font-mono text-sm p-4 rounded overflow-auto">
                    <div v-for="(line, i) in terminalOutput" :key="i"
                        :class="line.type === 'error' ? 'text-red-400' : line.type === 'info' ? 'text-blue-400' : ''">
                        {{ line.text }}
                    </div>
                    <div class="flex items-center">
                        <span class="text-green-500">root@opsi:~$</span>
                        <input v-model="command" @keyup.enter="executeCommand"
                            class="flex-1 ml-2 bg-transparent outline-none text-white" placeholder="Enter command..."
                            :disabled="executing" />
                    </div>
                </div>
            </div>
        </UCard>

        <div class="text-sm text-gray-500">
            <p>{{ $t('terminalInfo') || 'Execute commands on the opsi server. Use with caution.' }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t: $t } = useI18n()

// Helper to format translation keys
const t = (key: string) => {
    const translated = $t(key)
    if (translated && translated !== key) return String(translated)
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

const command = ref('')
const executing = ref(false)
const terminalOutput = ref([
    { text: 'Welcome to opsi terminal', type: 'info' },
    { text: 'Type commands to interact with the opsi server', type: 'info' },
    { text: '', type: 'normal' },
])

const executeCommand = async () => {
    if (!command.value.trim() || executing.value) return

    const cmd = command.value
    terminalOutput.value.push({ text: `root@opsi:~$ ${cmd}`, type: 'normal' })
    command.value = ''
    executing.value = true

    await new Promise(r => setTimeout(r, 300))

    // Simulate command output
    if (cmd === 'help') {
        terminalOutput.value.push({ text: 'Available commands: help, clear, opsi-admin, service', type: 'normal' })
    } else if (cmd === 'clear') {
        terminalOutput.value = []
    } else if (cmd.startsWith('opsi-admin')) {
        terminalOutput.value.push({ text: 'opsi-admin: connecting to opsiconfd...', type: 'info' })
        terminalOutput.value.push({ text: 'Connected successfully', type: 'normal' })
    } else {
        terminalOutput.value.push({ text: `Command executed: ${cmd}`, type: 'normal' })
    }

    executing.value = false
}
</script>
