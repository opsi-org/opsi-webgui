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
          style="font-family: monospace; font-size: 15px; text-align: justify ; display:block;"
          :class="{
            'bg-normal': log.startsWith('[0]') || log.startsWith('[1]') || log.startsWith('[6]') || log.startsWith('[7]') || log.startsWith('[8]') || log.startsWith('[9]'),
            'bg-danger': log.startsWith('[2]'),
            'bg-warning': log.startsWith('[3]'),
            'bg-info': log.startsWith('[4]'),
            'bg-success': log.startsWith('[5]')
          }"
        >
          {{ $t('(content)', {content: index}) }} {{ log }}
        </span>
      </div>
    </DivDScrollResult>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
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
  logResult: Array<string> = []
  isLoading: boolean = false
  filteredLog: Array<string> = []
  filterQuery: string = ''
  logrequest: LogRequest = { selectedClient: '', selectedLogType: '' }
  errorText: string = ''

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
.filter_logs{
  max-width: var(--component-width) !important;
}
.b-form-spinbutton output > div, .b-form-spinbutton output > bdi  {
  color: var(--color) !important;
}
</style>