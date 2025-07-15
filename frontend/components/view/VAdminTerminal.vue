<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div>
    <IconILoading v-if="isLoading" />
    <FormFTerminalSettings
      v-else
      v-model:terminal-id="terminalId"
      v-model:terminal-channel="terminalChannel"
      :disabled="isDisabled"
      @click-connect="connect"
      @click-disconnect="disconnect"
    />
  </div>
  <el-alert
    v-if="isDisabled"
    :title="$t('message.terminalDisabled')"
    type="warning"
    class="m-2 min-h-10"
    show-icon
  />
  <div v-else ref="terminalcontainer" class="m-2 max-w-full min-h-1/2 maxheight-top" />
</template>

<script setup lang="ts">
  import '@xterm/xterm/lib/xterm.js'
  import '@xterm/xterm/css/xterm.css'
  import { Terminal, type ITerminalOptions } from '@xterm/xterm'
  import { FitAddon } from '@xterm/addon-fit'
  import { SearchAddon } from '@xterm/addon-search'
  import { WebLinksAddon } from '@xterm/addon-web-links'
  import { useConfigserver } from '~/composables/mixins/useGet'
  import { useNotification } from '~/composables/mixins/useComponent'
  import { useMBus } from '~/composables/mixins/useMessagebus'
  import type { T_DisabledFeatures } from '~/types/APItypes'

  const $t = useI18n().t
  const { notifyWarning, notifyError } = useNotification()

  await useConfigserver(true, undefined, $t) // init with configserver if empty selectiondepots
  const ws = useMBus(undefined, false, $t)
  const terminalcontainer = ref()
  const mbTerminal = ref<any>(undefined)
  const terminalIdDefault = 'f40dbaa4-dc9f-46c0-9dc5-186a87a3eee5'
  const terminalId = ref<string>(terminalIdDefault)
  const terminalChannelDefault = 'service:config:terminal'
  const terminalChannel = ref(terminalChannelDefault)
  const isLoading = ref<boolean>(true)
  const isDisabled = ref<boolean | undefined>(undefined)

  watch(() => ws.wsBusMsg.value, _wsBusMsgObjectChangedTerminal)
  function _wsBusMsgObjectChangedTerminal() {
    if (ws.wsBusMsg.value === undefined) {
      console.warn('wsBusMsg is undefined')
      return
    }
    const msg = ws.wsBusMsg.value
    if (msg?.type && !msg.type.startsWith('terminal_')) {
      return
    }

    if (msg.type === 'terminal_open_event' || msg.type === 'terminal_resize_event') {
      if (msg.type === 'terminal_open_event') {
        terminalChannel.value = msg.back_channel
        mbTerminal.value.terminalChannel = terminalChannel.value
      }
      if (mbTerminal.value.cols !== msg.cols || mbTerminal.value.rows !== msg.rows) {
        mbTerminal.value.fitAddon.fit()
      }
    } else if (msg.type === 'terminal_data_read') {
      mbTerminal.value.write(msg.data)
    }
  }

  async function _fetchIsDisabled() {
    isLoading.value = true
    const { data, error } = await useApiGET<T_DisabledFeatures>(
      '/opsidata/server/disabled-features'
    )
    if (error) {
      isLoading.value = false
      return false
    }
    isLoading.value = false
    return data?.value?.includes('terminal') || storeConfigapp().config?.read_only
  }
  onMounted(async () => {
    while (ws.wsBus.value === undefined) {
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
    }
    isDisabled.value = await _fetchIsDisabled()
    waitForRefNot(isDisabled, undefined)
    if (isDisabled.value) {
      notifyWarning({ message: 'Terminal is disabled' })
      return
    }
    listenScreenResize()
  })

  onUnmounted(() => {
    try {
      disconnect()
    } catch (e) {
      console.warn('unmounted...', e)
    }
  })
  function listenScreenResize() {
    window.addEventListener('resize', () => {
      updateTerminalSize()
    })
  }

  function updateTerminalSize() {
    if (mbTerminal.value && mbTerminal.value.fitAddon) {
      mbTerminal.value.skipResizeEvent = false
      mbTerminal.value.fitAddon.fit()
    }
  }

  function disconnect() {
    if (mbTerminal.value === undefined) {
      console.warn('VAdminTerminal MessageBus: no terminal to disconnect')
      return
    }
    ws.wsTerminalClose(mbTerminal.value)
    terminalId.value = terminalIdDefault
    terminalChannel.value = terminalChannelDefault
    try {
      mbTerminal.value.dispose()
    } catch (e) {
      console.warn(e)
    }
    mbTerminal.value = undefined
    window.removeEventListener('resize', updateTerminalSize)
  }

  function connect() {
    waitForRefNot(isDisabled, undefined)
    if (isDisabled.value) {
      return
    }
    if (mbTerminal.value) {
      try {
        mbTerminal.value.dispose()
      } catch (e) {
        console.warn(e)
      }
      mbTerminal.value = undefined
    }

    mbTerminal.value = new Terminal({
      fontSize: 14,
      convertEol: true,
      disableStdin: false,
      cursorBlink: true,
      scrollback: 1000,
      theme: {
        background: '#060101',
        cursor: 'help',
      },
    } as ITerminalOptions)
    mbTerminal.value.terminalChannel = terminalChannel.value
    mbTerminal.value.loadAddon(new SearchAddon())
    mbTerminal.value.loadAddon(new WebLinksAddon())
    mbTerminal.value.fitAddon = new FitAddon()
    mbTerminal.value.loadAddon(mbTerminal.value.fitAddon)
    mbTerminal.value.open(terminalcontainer.value)
    mbTerminal.value.fitAddon.fit()

    ws.wsTerminalOpen(terminalId.value, mbTerminal.value)
    terminalId.value = mbTerminal.value.terminalId

    mbTerminal.value.onData((data: any) => {
      ws.wsTerminalSend(data, mbTerminal.value)
    })
    mbTerminal.value.skipResizeEvent = true
    mbTerminal.value.onResize((event: any) => {
      if (!mbTerminal.value.skipResizeEvent) {
        ws.wsTerminalResize(event.rows, event.cols, mbTerminal.value)
      }
    })

    // Why does html tag has visible scroll bar ?
    // => After connecting with terminal a div apears with 50000 width. this causes scrollbar to appear. We hide the horizontal scrollbar here (hopefully temporary:
    const elHtml = document.getElementsByTagName('html')[0]
    if (elHtml) {
      ;(elHtml.style as any)['overflow-x'] = 'hidden'
    }
  }

  function waitForRefNot(el: any, valueNot: any) {
    while (el === valueNot) {
      setTimeout(() => {}, 100)
    }
    return el
  }
</script>

<style scoped>
  .maxheight-top {
    height: calc(100vh - 290px);
    max-height: calc(100vh - 290px);
  }
  .is-mobile .maxheight-top {
    height: calc(100vh - 310px);
  }
  :deep(#terminal) {
    background-color: aqua !important;
    border: 5px solid red !important;
    width: 100%;
    height: 100%;
  }
  :deep(.xterm-screen) {
    padding-top: 5px !important;
    padding-right: 5px !important;
    margin-right: 5px !important;
  }
</style>
