<template>
  <div data-testid="VClientsLog" :class="{loadingCursor: isLoading}">
    <!-- <AlertAAlert ref="event_log_updated">
      <template #button>
        <b-button variant="primary" size="sm" class="float-right border-0 p-0" @click="_fetch">
          {{ $t('button.reload') }}
        </b-button>
      </template>
    </AlertAAlert> -->
    <BarBPageHeader v-if="asChild" :title="$t('title.log') + '' + t_fixed('keep-english.title.delimiter')" :subtitle="id" closeroute="/clients/" />
    <BarBPageHeader>
      <template #left>
        <slot v-if="!asChild" name="IDSelection" />
        <SelectSLogtype class="ml-1" :logtype.sync="logtype" />
        <SpinbuttonSBLoglevel class="ml-1" :loglevel.sync="loglevel" />
        <b-form-input
          v-if="logResult.length > 1"
          id="filter"
          v-model.trim="filterQuery"
          size="sm"
          class="ml-1 filter_logs"
          :aria-label="$t('form.filter.logs')"
          :placeholder="$t('form.filter.logs')"
          @keyup="filterLog"
        />
      </template>
    </BarBPageHeader>
    <OverlayOLoading :is-loading="isLoading" />
    <p v-if="errorText" />
    <div class="log-row-text" />
    <DivDScrollResult v-if="logResult">
      <div v-if="filteredLog.includes('')">
        {{ t_fixed('keep-english.empty') }}
      </div>
      <div
        v-for="(log, index) in filteredLog"
        :key="index"
        :class="{ 'd-none': !isLoglevelSmaller(log, loglevel) }"
      >
        <span
          v-if="log != ''"
          class="log-row-text"
          :class="{
            'log-row-1': log.startsWith('[1]'),
            'log-row-2': log.startsWith('[2]'),
            'log-row-3': log.startsWith('[3]'),
            'log-row-4': log.startsWith('[4]'),
            'log-row-5': log.startsWith('[5]'),
            'log-row-6': log.startsWith('[6]'),
            'log-row-7': log.startsWith('[7]'),
            'log-row-8': log.startsWith('[8]'),
            'log-row-9': log.startsWith('[9]'),
          }"
        >
          {{ t_fixed('keep-english.(content)').replace('content', index) }} {{ log }}
        </span>
      </div>
    </DivDScrollResult>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue, namespace } from 'nuxt-property-decorator'
import { MBus } from '../../mixins/messagebus'
import { Strings } from '../../mixins/strings'
import { AlertToast } from '../../mixins/component'
const selections = namespace('selections')
interface LogRequest {
  selectedClient: string,
  selectedLogType: string
}

@Component({ mixins: [AlertToast, MBus, Strings] })
export default class VClientLog extends Vue {
  $axios: any
  $t: any
  $root: any
  t_fixed: any
  showToast: any

  @Prop({ }) id!: string
  @Prop({ default: () => { return [] } }) 'testdata'!: Array<string>
  @Prop({ default: false }) 'asChild'!: string

  logtype: string = 'instlog'
  loglevel: number = 5
  isLoading: boolean = false
  logResult: Array<string> = []
  filteredLog: Array<string> = []
  filterQuery: string = ''
  logrequest: LogRequest = { selectedClient: '', selectedLogType: '' }
  errorText: string = ''

  @selections.Getter public XselectionLogClient!: string
  @selections.Getter public XselectionLogType!: string
  @selections.Getter public XselectionLogLevel!: number
  @selections.Mutation public XsetSelectionLogClient!: (s: string) => void
  @selections.Mutation public XsetSelectionLogType!: (s: string) => void
  @selections.Mutation public XsetSelectionLogLevel!: (s: number) => void

  wsBusMsg: any // mixin // store
  wsSubscribeChannel: any
  channels = ['event:log_updated']

  @Watch('wsBusMsg', { deep: true }) _wsBusMsgObjectChanged2 () {
    const msg = this.wsBusMsg
    // console.log('MessageBus: receive-watch: ', msg)
    if (msg && this.channels.includes(msg.channel) && msg.data.type === this.logtype && msg.data.object_id === this.id) {
      this.showToast({
        title: this.$t('message.info.event'),
        content: this.$t('message.info.event.log_updated'),
        variant: 'info',
        noAutoHide: true,
        buttons: [{
          text: this.$t('button.reload') as string,
          tooltip: this.$t('button.reload.tooltip.clients.removeselection') as string,
          action: this._fetch // shows reload button
        }]
      })
    } else {
      console.log('MessageBus other: ', msg.channel, msg.data)
    }
  }

  @Watch('filterQuery', { deep: true }) filterQueryChanged () { this.filterLog() }
  @Watch('loglevel', { deep: true }) loglevelChanged () {
    this.XsetSelectionLogLevel(this.loglevel)
  }

  @Watch('logtype', { deep: true }) async logtypeChanged () {
    this.XsetSelectionLogType(this.logtype)
    if (this.XselectionLogType && this.id) { await this._fetch() }
  }

  @Watch('id', { deep: true }) async idChanged () {
    // this.setSelectionLogClient(this.id)
    if (this.XselectionLogType && this.id) { await this._fetch() }
  }

  async beforeMount () {
    // eslint-disable-next-line brace-style
    if (this.id) { this.XsetSelectionLogClient(this.id) }
    else if (this.XselectionLogClient) { this.id = this.XselectionLogClient }

    this.loglevel = this.XselectionLogLevel
    this.logtype = this.XselectionLogType
    if (this.XselectionLogType && this.id) { await this._fetch() }
    if (this.testdata) { this.logResult = this.testdata }
  }

  async _fetch () {
    await this.getLog(this.id, this.logtype)
    const ref = (this.$refs.event_log_updated as any)
    ref?.hide()
  }

  // mounted () {
  //   // if (this.XselectionLogClient) { this.id = this.XselectionLogClient }
  //   // console.log('MessageBus subscribe channel', this.channels)
  //   // this.wsSubscribeChannel(this.channels) // done in messagebus init
  // }

  filterLog () {
    if (this.filterQuery) {
      this.filteredLog = this.logResult.filter(log =>
        log.toLowerCase().includes(this.filterQuery.toLowerCase())
      )
    } else {
      this.filteredLog = this.logResult
    }
  }

  isLoglevelSmaller (logrow:string, loglevel:number) {
    // match charakters in beginning with [<=loglevel] or not [0-9]
    const rxSelf2 = new RegExp('^((\\[[0-' + loglevel + ']\\])|[^\\[0-9\\]])', 'g')
    const result = RegExp(rxSelf2).exec(logrow)
    return !!result
  }

  async getLog (id: string, logtype: string) {
    this.isLoading = true
    this.logrequest.selectedClient = id
    this.logrequest.selectedLogType = logtype
    const params = this.logrequest
    await this.$axios.$get('/api/opsidata/log', { params })
      .then((response) => {
        this.logResult = response.result
        this.filteredLog = this.logResult
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        const ref = (this.$root.$children[1].$refs.errorAlert as any) || (this.$root.$children[2].$refs.errorAlert as any)
        ref.alert(detailedError, 'danger')
        this.errorText = this.$t('message.error.defaulttext') as string
      })
    this.isLoading = false
  }
}
</script>

<style>
.log-row-text {
  font-family: var(--font-family-log);
  text-align: left;
  display:block;
  font-size: var(--font-family-log-size);
}
.filter_logs{
  max-width: var(--component-width) !important;
}
.b-form-spinbutton output > div, .b-form-spinbutton output > bdi  {
  color: var(--color) !important;
}
</style>
