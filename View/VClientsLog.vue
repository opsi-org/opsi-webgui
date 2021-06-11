<template>
  <div>
    <BarBPageHeader v-if="asChild" :title="'Log - ' + id" closeroute="/clients/" />
    <BarBPageHeader>
      <template #filter>
        <b-form-input v-model.trim="filterQuery" placeholder="Filter" @keyup="filterLog" />
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
    <IconILoading v-if="isLoading" />
    <div v-else class="container-fluid result-scrollable">
      <div v-if="filteredLog == ''" class="container-fluid">
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
    </div>
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

  @Watch('logtype', { deep: true }) logtypeChanged () { this.getLog(this.id, this.logtype) }
  @Watch('id', { deep: true }) idChanged () { this.getLog(this.id, this.logtype) }
  @Watch('filterQuery', { deep: true }) filterQueryChanged () { this.filterLog() }

  beforeMount () {
    if (this.logtype) { this.getLog(this.id, this.logtype) }
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
        // eslint-disable-next-line no-console
        console.log(response)
        this.logResult = response.data.result
        this.filteredLog = this.logResult
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
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
.result-scrollable{
  height:700px;
  overflow-y: scroll;
}
</style>
