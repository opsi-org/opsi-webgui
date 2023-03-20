<template>
  <div data-testid="VAdminTerminal" class="VAdminTerminal">
    <!-- {{ uid }} -->
    <!-- <b-button :pressed.sync="dark" variant="primary">{{!dark? 'LightMode':'DarkMode'}}</b-button> -->
    <GridGFormItem>
      <template #label>
        <span class="terminalId">{{ $t('table.fields.terminalId') }}</span>
      </template>
      <template #value>
        <b-form-input id="terminalId" v-model="terminalId" :aria-label="$t('table.fields.terminalId')" type="text" />
      </template>
    </GridGFormItem>
    <GridGFormItem>
      <template #label>
        <span class="terminalChannel">{{ $t('table.fields.terminalChannel') }}</span>
      </template>
      <template #value>
        <b-form-input id="terminalChannel" v-model="terminalChannel" :aria-label="$t('table.fields.terminalChannel')" type="text" />
      </template>
    </GridGFormItem>

    <div ref="terminal" />

    <!-- <div class="box">
      <div id="xterm"></div>
    </div> -->
    <!-- :class="dark?'dark':'light'" -->
    <!-- v-html="html" -->

    <!-- <Terminal
      ref="terminal"
      prompt=""
      welcome-message=""
      class="console"
      :class="dark?'dark':'light'"
    /> -->
  </div>
</template>

<script lang="ts">

import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { SearchAddon } from 'xterm-addon-search'
import { WebLinksAddon } from 'xterm-addon-web-links'
// SearchAddon, FitAddon, WebLinksAddon
import 'xterm/css/xterm.css'
import 'xterm/lib/xterm.js'

// import Terminal from 'primevue/terminal'
// import TerminalService from 'primevue/terminalservice'
import { Component, namespace, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { MBus } from '../../mixins/uib-mixins'
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

  mbTerminal: any
  terminalId: string = 'f40dbaa4-dc9f-46c0-9dc5-186a87a3eee5'
  terminalChannel = 'service:config:terminal'

  @Watch('wsBusMsg', { deep: true }) _wsBusMsgObjectChangedTerminal () {
    const msg = this.wsBusMsg
    if (msg && msg.type && !msg.type.startsWith('terminal_')) { return }

    if (msg.type === 'terminal_open_event') {
      this.terminalChannel = msg.back_channel
      this.mbTerminal.terminalChannel = this.terminalChannel
    } else if (msg.type === 'terminal_data_read') {
      this.mbTerminal.write(msg.data)
    } else if (msg.type === 'terminal_close_event') {
      // eslint-disable-next-line no-octal-escape, quotes
      // this.mbTerminal.writeln("\r\n\033[1;37m> Terminal closed <\033[0m")
      this.mbTerminal.writeln('> # Terminal closed')
      // eslint-disable-next-line no-octal-escape, quotes
      // this.mbTerminal.write("\033[?25l") // Make cursor invisible
    }
    // else if (resize...) TODO
  }

  created () {
    if (this.wsBus === undefined) {
      console.debug('MessageBus WS: connect from VAdminTerminal.vue')
      this.wsInit()
    }
  }

  mounted () {
    // this.wsWait(2000)
    // if (this.mbTerminal) {
    //   this.mbTerminal.dispose()
    // }

    this.mbTerminal = new Terminal({
      cursorBlink: true,
      scrollback: 1000,
      fontSize: 14,
      allowProposedApi: true,

      // cursorBlink: true,
      // scrollback: 1000,
      // fontSize: 14,
      // allowProposedApi: true,
      // disableStdin: false,
      // cursorStyle: 'underline'
      // rendererType: 'canvas', // Tipo de representación
      // rows: 35,
      // theme: 'light',
      theme: {
        // foreground: 'yellow', //Fuente
        background: '#060101', //Fondo de fondo de fondo
        cursor: 'help' //CURSOR
      }
    })
    this.mbTerminal.skipResizeEvent = false


    this.mbTerminal.terminalChannel = this.terminalChannel

    // this.mbTerminal.open(document.getElementById('xterm'))
    const searchAddon = new SearchAddon()
    this.mbTerminal.loadAddon(searchAddon)
    const webLinksAddon = new WebLinksAddon()
    this.mbTerminal.loadAddon(webLinksAddon)
    this.mbTerminal.fitAddon = new FitAddon()
    this.mbTerminal.loadAddon(this.mbTerminal.fitAddon)

    this.mbTerminal.open(this.$refs.terminal as any)

    // const _this = this //Asegúrate de redefinir unothis,de lo contrariothisSeñalar al problema
    // this.mbTerminal.onData((key) => {
    //   console.log('send..', key)
    //   this.wsTerminalSend()
    // })

    this.wsTerminalOpen(this.terminalId, this.mbTerminal)
    this.terminalId = this.mbTerminal.terminalId
    // this.mbTerminal.fitAddon.fit()
    // this.mbTerminal.focus()

    this.mbTerminal.onData((data) => {
      this.wsTerminalSend(data, this.mbTerminal)
    })

    // const terminal = this.$refs.terminal as any
    // terminal.ondragenter = function (event) {
    //   return false
    // }
    // terminal.ondragover = function (event) {
    //   event.preventDefault()
    // }
    // terminal.ondragleave = function (event) {
    //   return false
    // }
  }

  beforeDestroy () {
    // disconnect msgbus terminal channel
  }
}
</script>

<style>
.console {
  min-height: 300px;
  min-width: 300px;
  font-family: monospace;
  text-align: left;
  overflow-y: auto;
}
.console.dark {
  background-color: black;
  color: #fff;
}
.console.light {
  background-color: white;
  color: black;
}

.console > .consolerow {
  /* background-color: green !important; */
  /* color: blue !important; */
  /* min-width: 100px; */
  margin: 0px;
}
</style>
