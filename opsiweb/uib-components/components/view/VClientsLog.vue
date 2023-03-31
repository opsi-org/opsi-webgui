<template>
  <div data-testid="VClientsLog" :class="{loadingCursor: isLoading}">
    <AlertAAlert ref="logErrorAlert">
      <!-- <b-button
        v-if="!isLoading"
        variant="outline-dark"
        class="float-right"
        @click="$fetch"
      >
        {{ $t('button.tryAgain') }}
      </b-button> -->
    </AlertAAlert>
    <BarBPageHeader v-if="asChild" :title="$t('title.log') + ' - '" :subtitle="id" closeroute="/clients/" />
    <BarBPageHeader>
      <template #left>
        <slot v-if="!asChild" name="IDSelection" />
        <SelectSLogtype class="ml-1" :logtype.sync="logtype" />
        <SpinbuttonSBLoglevel class="ml-1" :loglevel.sync="loglevel" />
        <b-form-input
          v-if="logResult.length > 1"
          id="filter"
          v-model.trim="filterQuery"
          class="ml-1 filter_logs"
          :aria-label="$t('form.filter.logs')"
          :placeholder="$t('form.filter.logs')"
          @keyup="filterLog"
        />
      </template>
    </BarBPageHeader>
    <OverlayOLoading :is-loading="isLoading" />
    <p v-if="errorText" />
    <div class="log-row-text">

    </div>
    <DivDScrollResult v-if="logResult">
      <div v-if="filteredLog.includes('')">
        {{ $t('empty') }}
      </div>
      <div
        v-for="(log, index) in filteredLog"
        :key="index"
        :class="{ 'd-none': !isLoglevelSmaller(log, loglevel) }"
      >
        <span
          v-if="index != 0"
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
            // 'bg-danger': log.startsWith('[2]'),
            // 'bg-warning': log.startsWith('[3]'),
            // 'bg-info': log.startsWith('[4]'),
            // 'bg-success': log.startsWith('[5]')
          }"
        >
          {{ $t('(content)', {content: index}) }} {{ log }}
        </span>
      </div>
    </DivDScrollResult>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue, namespace } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
const selections = namespace('selections')
interface LogRequest {
    selectedClient: string,
    selectedLogType: string
}
@Component({ mixins: [Constants] })
export default class VClientLog extends Vue {
  $axios: any
  $t: any

  @Prop({ }) id!: string
  @Prop({ default: false }) 'asChild'!: string

  logtype: string = 'instlog'
  loglevel: number = 5
  isLoading: boolean = false
  logResult: Array<string> = ['',
    '[0] [2023-03-31 12:29:49.371] [ ] opsiclientd service start (service.py:132)',
    '[1] [2023-03-31 12:29:49.371] [ ] opsiclientd service start (service.py:132)',
    '[2] [2023-03-31 12:29:49.371] [ ] opsiclientd service start (service.py:132)',
    '[3] [2023-03-31 12:29:49.371] [ ] opsiclientd service start (service.py:132)',
    '[4] [2023-03-31 12:29:49.371] [ ] opsiclientd service start (service.py:132)',
    '[5] [2023-03-31 12:29:49.371] [ ] opsiclientd service start (service.py:132)',
    '[6] [2023-03-31 12:29:49.371] [ ] opsiclientd service start (service.py:132)',
    '[7] [2023-03-31 12:29:49.371] [ ] opsiclientd service start (service.py:132)',
    '[8] [2023-03-31 12:29:49.371] [ ] opsiclientd service start (service.py:132)',
    '[0] [2023-03-31 12:29:49.371] [ ] opsiclientd service start (service.py:132)',
    '[7] [2023-03-31 12:29:49.371] [ ] OpsiclientdService initiating (service.py:35)', '[7] [2023-03-31 12:29:49.371] [ ] OpsiclientdService initiated (service.py:39)', '[5] [2023-03-31 12:29:49.371] [ ] Handling start request (service.py:87)', '[7] [2023-03-31 12:29:49.371] [ ] Reporting service status: 4 (service.py:48)', '[7] [2023-03-31 12:29:49.371] [ ] Took 0.00 seconds to report service running status (service.py:91)', '[7] [2023-03-31 12:29:49.640] [ ] Opsiclient initiating (Opsiclientd.py:67)', '[7] [2023-03-31 12:29:49.640] [ ] EventListener initiated (Basic.py:248)', '[7] [2023-03-31 12:29:49.672] [opsiclientd ] Found running \'opsiclientd\' process: psutil.Process(pid=5892, name=\'opsiclientd.exe\', status=\'running\', started=\'12:29:46\') (__init__.py:52)', '[7] [2023-03-31 12:29:49.694] [opsiclientd ] Setting state \'shutdown_cancel_counter\' to 0 (State.py:108)', '[5] [2023-03-31 12:29:49.694] [opsiclientd ] Starting timeline (database location: C:\opsi.org\opsiclientd\timeline.sqlite) (Timeline.py:137)', '[6] [2023-03-31 12:29:49.694] [opsiclientd ] Connecting to sqlite:///C:\opsi.org\opsiclientd\timeline.sqlite (SQLite.py:71)', '[7] [2023-03-31 12:29:49.709] [opsiclientd ] SQLite connected: <SQLite(database=C:\opsi.org\opsiclientd\timeline.sqlite)> (SQLite.py:92)', '[5] [2023-03-31 12:29:49.725] [opsiclientd ] Trying to read config from file: \'C:\Program Files (x86)\opsi.org\opsi-client-agent\opsiclientd\opsiclientd.conf\' (Config.py:527)', '[7] [2023-03-31 12:29:49.725] [opsiclientd ] Parsing ini file \'C:\Program Files (x86)\opsi.org\opsi-client-agent\opsiclientd\opsiclientd.conf\' (__init__.py:543)', '[7] [2023-03-31 12:29:49.725] [opsiclientd ] Trying to lock file \'C:\Program Files (x86)\opsi.org\opsi-client-agent\opsiclientd\opsiclientd.conf\' (0/2000) (__init__.py:228)', '[7] [2023-03-31 12:29:49.725] [opsiclientd ] File \'C:\Program Files (x86)\opsi.org\opsi-client-agent\opsiclientd\opsiclientd.conf\' locked after 0 millis (__init__.py:249)', '[7] [2023-03-31 12:29:49.725] [opsiclientd ] Finished reading file after 0.000 seconds (__init__.py:620)', '[6] [2023-03-31 12:29:49.725] [opsiclientd ] Setting config global.log_level to 6 (Config.py:499)']
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

  @Watch('filterQuery', { deep: true }) filterQueryChanged () { this.filterLog() }
  @Watch('loglevel', { deep: true }) loglevelChanged () {
    this.XsetSelectionLogLevel(this.loglevel)
  }

  @Watch('logtype', { deep: true }) logtypeChanged () {
    this.XsetSelectionLogType(this.logtype)
    if (this.XselectionLogType && this.id) { this.getLog(this.id, this.logtype) }
  }

  @Watch('id', { deep: true }) idChanged () {
    // this.setSelectionLogClient(this.id)
    if (this.XselectionLogType && this.id) { this.getLog(this.id, this.logtype) }
  }

  beforeMount () {
    // eslint-disable-next-line brace-style
    if (this.id) { this.XsetSelectionLogClient(this.id) }
    else if (this.XselectionLogClient) { this.id = this.XselectionLogClient }

    this.loglevel = this.XselectionLogLevel
    this.logtype = this.XselectionLogType
    if (this.XselectionLogType && this.id) { this.getLog(this.id, this.logtype) }
  }

  mounted () {
    if (this.XselectionLogClient) { this.id = this.XselectionLogClient }
  }

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
    const result = logrow.match(rxSelf2)
    return !!result
  }

  async getLog (id: string, logtype: string) {
    this.isLoading = true
    this.logrequest.selectedClient = id
    this.logrequest.selectedLogType = logtype
    const params = this.logrequest
    await this.$axios.$get('/api/opsidata/log', { params })
      .then((response) => {
        // this.logResult = response.result
        this.filteredLog = this.logResult
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = this.$refs.logErrorAlert as any
        ref.alert(this.$t('message.error.fetch') as string + 'Log', 'danger', detailedError)
        this.errorText = this.$t('message.error.defaulttext') as string
      })
    this.isLoading = false
  }
}
</script>

<style>
.log-row-text {
  font-family: var(--font-family-log);
  text-align: justify ;
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
