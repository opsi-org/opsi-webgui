<template>
  <div data-testid="VAdminTerminal" class="VAdminTerminal">
    <GridGFormItem :label="$t('table.fields.terminalId')" labelclass="lblTerminalId" variant="longvalue">
      <template #value>
        <b-input-group>
          <b-form-input id="terminalId" v-model="terminalId" size="sm" :aria-label="$t('table.fields.terminalId')" type="text" />
          <template #append>
            <b-button variant="primary" size="sm" @click="() => {terminalId = ''}">
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
            <b-button variant="primary" size="sm" @click="() => {terminalChannel = terminalChannelDefault}">
              {{ $t("button.clear") }}
            </b-button>
          </template>
        </b-input-group>
      </template>
    </GridGFormItem>
    <GridGFormItem variant="longvalue">
      <template #value>
        <b-button variant="primary" size="sm" block @click="init">
          {{ $t('button.reconnect') }}
        </b-button>
      </template>
    </GridGFormItem>
    <div ref="terminalcontainer" class="terminalContainer">
      <div id="terminal" ref="terminal" />
    </div>
  </div>
</template>

<script lang="ts">

import 'xterm/css/xterm.css'
import 'xterm/lib/xterm.js'
import { Terminal } from 'xterm'
// eslint-disable-next-line import/named
import { FitAddon } from 'xterm-addon-fit'
// eslint-disable-next-line import/named
import { SearchAddon } from 'xterm-addon-search'
// eslint-disable-next-line import/named
import { WebLinksAddon } from 'xterm-addon-web-links'
// SearchAddon, FitAddon, WebLinksAddon

import { Component, namespace, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { MBus } from '../../mixins/messagebus'
const cache = namespace('data-cache')

@Component({ mixins: [MBus] })
export default class VAdminTerminal extends Vue {
  @Prop({ }) id!: string
  @Prop({ }) type!: string
  @Prop({ default: false }) 'asChild'!: string
  @Prop({ default: false }) 'closeroute'!: string
  @cache.Getter public opsiconfigserver!: string

  wsInit: any // mixin // store
  wsBus: any // mixin // store
  wsBusMsg: any // mixin // store
  wsTerminalOpen: any
  wsTerminalSend: any // mixin // store
  wsTerminalResize: any

  mbTerminal: any
  // terminalId: string = 'f40dbaa4-dc9f-46c0-9dc5-186a87a3eee5'
  terminalId: string = ''
  terminalChannelDefault = 'service:config:terminal'
  terminalChannel = this.terminalChannelDefault

  @Watch('wsBusMsg', { deep: true }) _wsBusMsgObjectChangedTerminal () {
    const msg = this.wsBusMsg
    if (msg?.type && !msg.type.startsWith('terminal_')) { return }

    if (msg.type === 'terminal_open_event' || msg.type === 'terminal_resize_event') {
      if (msg.type === 'terminal_open_event') {
        this.terminalChannel = msg.back_channel
        this.mbTerminal.terminalChannel = this.terminalChannel
      }
      if (this.mbTerminal.cols !== msg.cols || this.mbTerminal.rows !== msg.rows) {
        this.mbTerminal.fitAddon.fit()
      }
    } else if (msg.type === 'terminal_data_read') {
      this.mbTerminal.write(msg.data)
    } else if (msg.type === 'terminal_close_event') {
      this.mbTerminal.writeln('> # Terminal closed')
    }
  }

  created () {
    if (this.wsBus === undefined) {
      this.wsInit()
    }
  }

  mounted () {
    this.init()
    this.listenScreenResize()
  }

  beforeDestroy () {
    // disconnect msgbus terminal channel
  }

  listenScreenResize () {
    window.addEventListener('resize', () => {
      this.updateTerminalSize()
    })
  }

  updateTerminalSize () {
    this.mbTerminal.fitAddon.fit()
  }

  init () {
    if (this.mbTerminal) {
      this.mbTerminal.dispose()
    }

    this.mbTerminal = new Terminal({
      fontSize: 14,
      convertEol: true,
      disableStdin: false,
      cursorBlink: true,
      scrollback: 1000,
      theme: {
        background: '#060101',
        cursor: 'help'
      }
    })
    this.mbTerminal.terminalChannel = this.terminalChannel
    const searchAddon = new SearchAddon()
    this.mbTerminal.loadAddon(searchAddon)
    const webLinksAddon = new WebLinksAddon()
    this.mbTerminal.loadAddon(webLinksAddon)
    this.mbTerminal.fitAddon = new FitAddon()
    this.mbTerminal.loadAddon(this.mbTerminal.fitAddon)
    this.mbTerminal.open(this.$refs.terminalcontainer as any)
    this.mbTerminal.fitAddon.fit()

    this.wsTerminalOpen(this.terminalId, this.mbTerminal)
    this.terminalId = this.mbTerminal.terminalId

    this.mbTerminal.onData((data) => {
      this.wsTerminalSend(data, this.mbTerminal)
    })
    this.mbTerminal.onResize((event) => {
      // console.debug('Resize: ', event.rows, event.cols)
      if (this.mbTerminal.skipResizeEvent) {
        this.mbTerminal.skipResizeEvent = false
      } else {
        this.wsTerminalResize(event.rows, event.cols, this.mbTerminal)
        this.mbTerminal.fitAddon.fit()
      }
    })
  }
}
</script>

<style>
.terminalContainer {
  width:100%;
  min-height:75vh;
}
#terminal
{
  width:100%;
  height:100%;
}
</style>
