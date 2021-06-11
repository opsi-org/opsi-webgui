<template>
  <div>
    <!-- TODO: Need backend method like '/api/opsidata/clientIds' for fetching only list of clientIds  -->
    <BarBPageHeader v-if="asChild" :title="'Log - ' + id" closeroute="/clients/" />
    <BarBPageHeader>
      <template #filter>
        <b-form-input v-model.trim="filterQuery" placeholder="Filter" @keyup="filterLog" />
      </template>
      <template v-if="!asChild" #selection>
        {{ fetchClientIds () }}
        <b-form-select v-model="id" :options="clientIds">
          <template #first>
            <b-form-select-option :value="null" disabled>
              -- Please select a Client --
            </b-form-select-option>
          </template>
        </b-form-select>
      </template>
      <template #log>
        <b-form-select
          v-model="logtype"
          :options="logTypes"
        />
        <b-form-spinbutton
          v-model="loglevel"
          class="loglevel_spinbutton"
          min="0"
          max="8"
          step="1"
          inline
        />
      </template>
    </BarBPageHeader>
    <b-card no-body class="border-0 container-fluid">
      <IconILoading v-if="isLoading" />
      <b-card-text v-else>
        <div v-if="filteredLog == ''">
          No Logs Found !
        </div>
        <div
          v-for="(log, index) in filteredLog"
          :key="index"
          :class="{ 'd-none': !isLoglevelSmaller(log, loglevel) }"
        >
          <span
            v-if="index != 0"
            style="font-family: monospace;"
            :class="{
              'text-secondary': true,
              'text-secondary': log.startsWith('[0]'),
              'text-secondary': log.startsWith('[1]'),
              'text-danger': log.startsWith('[2]'),
              'text-warning': log.startsWith('[3]'),
              'text-primary': log.startsWith('[4]'),
              'text-success': log.startsWith('[5]'),
              'text-secondary': log.startsWith('[6]'),
              'text-muted': log.startsWith('[7]'),
              'text-muted': log.startsWith('[8]'),
              'text-muted': log.startsWith('[9]')
            }"
          >
            ({{ index }}) {{ log }}
          </span>
        </div>
      </b-card-text>
    </b-card>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'nuxt-property-decorator'
interface LogRequest {
    selectedClient: string,
    selectedLogType: string
}
@Component
export default class VClientLog extends Vue {
  @Prop({ }) id!: string
  @Prop({ default: false }) 'asChild'!: string

  logtype: string = 'opsiconfd'
  loglevel: number = 5
  logResult: Array<string> = []
  filteredLog: Array<string> = []
  filterQuery: string = ''
  logrequest: LogRequest = { selectedClient: '', selectedLogType: '' }
  logTypes: Array<string> = ['bootimage', 'clientconnect', 'instlog', 'opsiconfd', 'userlogin']
  isLoading: boolean = false
  clientIds: Array<string> = []

  @Watch('logtype', { deep: true }) logtypeChanged () { this.getLog(this.id, this.logtype) }
  @Watch('id', { deep: true }) idChanged () { this.getLog(this.id, this.logtype) }
  @Watch('filterQuery', { deep: true }) filterQueryChanged () { this.filterLog() }

  beforeMount () {
    if (this.logtype && this.id) { this.getLog(this.id, this.logtype) }
  }

  fetchClientIds () {
    this.clientIds = ['agorumcore-tst.uib.local', 'akunde1.uib.local']
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
  }// end isLoglovelSmaller

  async getLog (id: string, logtype: string) {
    this.isLoading = true
    this.logrequest.selectedClient = id
    this.logrequest.selectedLogType = logtype
    await this.$axios.post('/api/opsidata/log', JSON.stringify(this.logrequest))
      .then((response) => {
        this.logResult = response.data.result
        this.filteredLog = this.logResult
      }).catch((error) => {
        this.logResult = error
        this.filteredLog = this.logResult
      })
    this.isLoading = false
  } // end getLog
}
</script>

<style>
.loglevel_spinbutton{
  min-width: 160px !important;
}
</style>
