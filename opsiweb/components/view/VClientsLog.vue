<template>
  <div>
    <BarBPageHeader v-if="asChild" :title="'Log - ' + id" closeroute="/clients/" />
    <BarBPageHeader>
      <template #filter>
        <b-form-input v-model.trim="filterQuery" placeholder="Filter" @keyup="filterLog" />
      </template>
      <template v-if="!asChild" #selection>
        <slot name="IDSelection" />
      </template>
      <template #log>
        <SelectSLogtype :logtype.sync="logtype" />
        <SpinbuttonSBLoglevel :loglevel.sync="loglevel" />
      </template>
    </BarBPageHeader>
    <IconILoading v-if="isLoading" />
    <DivDScrollable v-else>
      <template slot="content">
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
      </template>
    </DivDScrollable>
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
  loglevel: number = 0
  logResult: Array<string> = []
  filteredLog: Array<string> = []
  filterQuery: string = ''
  logrequest: LogRequest = { selectedClient: '', selectedLogType: '' }
  isLoading: boolean = false

  @Watch('logtype', { deep: true }) logtypeChanged () { if (this.logtype && this.id) { this.getLog(this.id, this.logtype) } }
  @Watch('id', { deep: true }) idChanged () { if (this.logtype && this.id) { this.getLog(this.id, this.logtype) } }
  @Watch('filterQuery', { deep: true }) filterQueryChanged () { this.filterLog() }

  beforeMount () {
    if (this.logtype && this.id) { this.getLog(this.id, this.logtype) }
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
</style>
