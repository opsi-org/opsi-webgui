<template>
  <div>
    <BarBPageHeader v-if="asChild" :title="'Log - ' + id" closeroute="/clients/" />
    <BarBPageHeader>
      <template #filter>
        <b-form-input class="filter_input" placeholder="Filter" />
      </template>
      <template #log>
        <b-form-select
          v-model="logtype"
          class="logtype_select"
          :options="logTypes"
        />
        <b-form-spinbutton
          v-model="loglevel"
          size="sm"
          class="loglevel_spinbutton"
          min="0"
          max="8"
          step="1"
          inline
        />
      </template>
    </BarBPageHeader>
    <b-card>
      <b-card-text>
        {{ logResult }}
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
  logrequest: LogRequest = { selectedClient: '', selectedLogType: '' }
  logTypes: Array<string> = ['bootimage', 'clientconnect', 'instlog', 'opsiconfd', 'userlogin']
  // isLoading: boolean = true

  @Watch('logtype', { deep: true }) logtypeChanged () { this.getLog(this.id, this.logtype) }
  @Watch('id', { deep: true }) idChanged () { this.getLog(this.id, this.logtype) }

  beforeMount () {
    if (this.logtype) { this.getLog(this.id, this.logtype) }
  }

  getLog (id: string, logtype: string) {
    this.logrequest.selectedClient = id
    this.logrequest.selectedLogType = logtype
    this.$axios.post('/api/opsidata/log', this.logrequest)
      .then((response) => {
        this.logResult = response.data.result
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        this.logResult = error
      })
  } // end getLog
}
</script>

<style>
.filter_input{
  max-width: 100px !important;
}
.logtype_select{
  max-width: 100px !important;
}
.loglevel_spinbutton{
  max-width: 150px !important;
}
</style>
