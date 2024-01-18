<template>
  <div>
    <h3>Terminal</h3>
    <FormFTerminalSettings
      v-model:terminalId="terminalId"
      v-model:terminalChannel="terminalChannel"
      @click-connect="connect"
      @click-disconnect="disconnect"
    />
  </div>
  <!-- <div data-testid="VAdminTerminal" class="VAdminTerminal">
    <GridGFormItem :label="$t('table.fields.terminalId')" labelclass="lblTerminalId" variant="longvalue">
      <template #value>
        <b-input-group>
          <b-form-input id="terminalId" v-model="terminalId" size="sm" :aria-label="$t('table.fields.terminalId')" type="text" />
          <template #append>
            <b-button class="buttonclear1" variant="primary" size="sm" @click="() => {terminalId = ''}">
              {{ $t("button.clear") }}
            </b-button>
          </template>
        </b-input-group>
      </template>
    </GridGFormItem>
    <GridGFormItem :label="$t('table.fields.terminalChannel')" labelclass="lblTerminalChannel" variant="longvalue">
      <template #value>
        <b-input-group>
          <b-form-input id="terminalChannel" v-model="terminalChannel" size="sm" :aria-label="$t('table.fields.terminalChannel')" type="text" />
          <template #append>
            <b-button class="buttonclear2" variant="primary" size="sm" @click="() => {terminalChannel = terminalChannelDefault}">
              {{ $t("button.clear") }}
            </b-button>
          </template>
        </b-input-group>
      </template>
    </GridGFormItem>
    <GridGFormItem variant="longvalue">
      <template #value>
        <b-button class="buttonreconnect" variant="primary" size="sm" block @click="init">
          {{ $t('button.reconnect') }}
        </b-button>
      </template>
    </GridGFormItem>-->
    <div ref="terminalcontainer"
      class="m-2 max-w-full min-h-3/4 maxheight-top "
      >
      <!-- class="terminalContainer border-red-500 border-1 w-" -->
      <!-- container -->
      <!-- <div id="terminal" ref="terminal" class="border-sky-500 order-1" /> -->
    </div>
    <!--
  </div>
  -->
</template>

<script setup lang="ts">

import 'xterm/css/xterm.css'
import 'xterm/lib/xterm.js'
import { useConfigserver } from '~/composables/mixins/useGet';
import { useMBus } from '~/composables/mixins/useMessagebus';
import { Terminal, type ITerminalOptions } from 'xterm'
// // eslint-disable-next-line import/named
import { FitAddon } from 'xterm-addon-fit'
// eslint-disable-next-line import/named
import { SearchAddon } from 'xterm-addon-search'
// eslint-disable-next-line import/named
import { WebLinksAddon } from 'xterm-addon-web-links'
// SearchAddon, FitAddon, WebLinksAddon

/*
import { Component, namespace, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { MBus } from '../../mixins/messagebus'
import { AlertToast } from '../../mixins/component'
const cache = namespace('data-cache')

@Component({ mixins: [MBus, AlertToast] })
export default class VAdminTerminal extends Vue {
  $t: any
  $refs: any
  $axios: any
  showToastError: any
  @Prop({ }) id!: string
  @Prop({ }) type!: string
  @Prop({ default: false }) 'asChild'!: string
  @Prop({ default: false }) 'closeroute'!: string
  @cache.Getter public opsiconfigserver!: string
  */
await useConfigserver(true) // init with configserver if empty selectiondepots
const ws = useMBus()
const terminalcontainer = ref()
const terminal = ref()
  /*
  wsInit: any // mixin // store
  wsBus: any // mixin // store
  wsBusMsg: any // mixin // store
  wsTerminalOpen: any
  wsTerminalSend: any // mixin // store
  wsTerminalResize: any

  */
const mbTerminal = ref<any>(undefined)
const terminalIdDefault = 'f40dbaa4-dc9f-46c0-9dc5-186a87a3eee5'
const terminalId = ref<string>(terminalIdDefault)
const terminalChannelDefault = 'service:config:terminal'
const terminalChannel = ref(terminalChannelDefault)
const isLoading = ref<boolean>(true)
const isDisabled = ref<boolean|undefined>(undefined)

  // @Watch('wsBusMsg', { deep: true })
watch(() => ws.wsBusMsg.value, _wsBusMsgObjectChangedTerminal)
function _wsBusMsgObjectChangedTerminal () {
  console.log(`VAdminTerminal MessageBus watch msg:\n\ttype:\t${ws.wsBusMsg.value.type}\n\tsender:\t${ws.wsBusMsg.value.sender}\n\tdata:\t`, ws.wsBusMsg.value)
  const msg = ws.wsBusMsg.value
  if (msg?.type && !msg.type.startsWith('terminal_')) { return }

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
  } else if (msg.type === 'terminal_close_event') {
    // mbTerminal.value.writeln('> # Terminal closed')
    console.log('> # Terminal closed')
  }
}
/*
  async _fetchIsDisabled () {
    this.isLoading = true
    return await this.$axios.get('/api/opsidata/server/disabled-features')
      .then((response) => {
        if (response.data === null) {
          this.isLoading = false
          return []
        } else {
          this.isLoading = false
          return response.data.includes('terminal')
        }
      }).catch((error) => {
        this.showToastError(error)
        this.isLoading = false
      })
  }
*/
/*
async created () {
    while (this.isDisabled === undefined) { await new Promise(resolve => setTimeout(resolve, 100)) }
    this.isDisabled = await this._fetchIsDisabled()
    if (!this.isDisabled && this.wsBus === undefined) {
      this.wsInit()
    }
  }
*/
onMounted(async () => {
  while (ws.wsBus.value === undefined) {
    console.log('VAdminTerminal MessageBus: wait for wsBus')
    await new Promise(resolve => {
      console.log('VAdminTerminal MessageBus: wait for wsBus')
      setTimeout(resolve, 100)
    })
  }
  console.log('VAdminTerminal MessageBus: wsBus ready. connect to terminal...')
  // connect()
  // ws.wsInit() // already done in useMBus().onMounted
  listenScreenResize()
})

onUnmounted(() => {
  disconnect()
})
function listenScreenResize () {
  window.addEventListener('resize', () => {

    console.log('VAdminTerminal MessageBus-Window Resize: ')
    updateTerminalSize()
  })
}

function updateTerminalSize () {
  mbTerminal.value.skipResizeEvent = false
  mbTerminal.value.fitAddon.fit()
}

function disconnect () {
  console.group('VAdminTerminal MessageBus disconnect')
  ws.wsTerminalClose(mbTerminal.value)
  terminalId.value = terminalIdDefault
  terminalChannel.value = terminalChannelDefault
  try { mbTerminal.value.dispose() } catch (e) { console.warn(e) }
  mbTerminal.value = undefined
  window.removeEventListener('resize', updateTerminalSize)
  console.groupEnd()
}

function connect () {
  console.group('VAdminTerminal MessageBus connect')
  if (mbTerminal && mbTerminal.value) {
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
      cursor: 'help'
    }
  } as ITerminalOptions)
  mbTerminal.value.terminalChannel = terminalChannel.value
  // const searchAddon = new SearchAddon()
  mbTerminal.value.loadAddon(new SearchAddon())
  // const webLinksAddon = new WebLinksAddon()
  mbTerminal.value.loadAddon(new WebLinksAddon())
  mbTerminal.value.fitAddon = new FitAddon()
  mbTerminal.value.loadAddon(mbTerminal.value.fitAddon)
  mbTerminal.value.open(terminalcontainer.value)
  mbTerminal.value.fitAddon.fit()

  console.log('VAdminTerminal MessageBus: ', mbTerminal.value)
  ws.wsTerminalOpen(terminalId.value, mbTerminal.value)
  console.log('VAdminTerminal MessageBus: ', mbTerminal.value.terminalChannel)
  terminalId.value = mbTerminal.value.terminalId

  mbTerminal.value.onData((data: any) => {
    ws.wsTerminalSend(data, mbTerminal.value)
  })
  mbTerminal.value.skipResizeEvent = true
  mbTerminal.value.onResize((event: any) => {
  //   // TODO: resize is called too often on window resize

    console.log('VAdminTerminal MessageBus Resize: ', event.rows, event.cols)
    if (mbTerminal.value.skipResizeEvent) {
      console.log('VAdminTerminal MessageBus Resize: skip resize event')
      // mbTerminal.value.skipResizeEvent = false
    } else {
      const r = ws.wsTerminalResize(event.rows, event.cols, mbTerminal.value)
      // if (r) mbTerminal.value.fitAddon.fit()
    }
  })
  console.groupEnd()
}
</script>

<style scoped>
/*.terminalContainer {
  width:100%;
  min-height:75vh;
}
*/
.maxheight-top {
  height: calc(100vh - 270px);
}
.is-mobile .maxheight-top {
  height: calc(100vh - 310px);
}
:deep(#terminal)
{
  width:100%;
  height:100%;
}
</style>
