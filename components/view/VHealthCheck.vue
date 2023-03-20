<template>
  <div data-testid="VHealthCheck" class="VHealthCheck">
    <AlertAAlert ref="healthCheckAlert" />
    <OverlayOLoading :is-loading="$fetchState.pending" />
    <BarBPageHeader v-if="diagnosticdata">
      <template v-if="!jsonformat" #left>
        <!-- <InputIFilterTChanges :placeholder="$t('Filter')" :filter.sync="filter" /> -->
        <b-button
          size="sm"
          variant="outline-primary"
          class="border-0"
          :pressed.sync="expandAll"
        >
          <b-icon v-if="expandAll" :icon="iconnames.save" />
          <b-icon v-else />
          {{ $t('Expand All') }}
        </b-button>
      </template>
      <template #right>
        <div v-if="jsonformat">
          <b-button class="downloadButton border-0" variant="outline-primary" @click="downloadHealthData">
            <b-icon :icon="iconnames.download" /> {{ $t('Download') }}
          </b-button>
        </div>
        <b-form-checkbox v-model="jsonformat" class="ml-4 pt-1" switch>
          {{ $t('JSON') }}
        </b-form-checkbox>
      </template>
    </BarBPageHeader>
    <template v-if="jsonformat">
      <DivDScrollResult>
        <pre>{{ prettyJSON(diagnosticdata) }}</pre>
      </DivDScrollResult>
    </template>
    <template v-else>
      <!-- {{ diagnosticdata }} -->
      <span v-for="diagnostic,k in diagnosticdata" :key="k">
        <b-button v-b-toggle="'collapse-'+k" class="text-left font-weight-bold border-0" block variant="outline-primary">{{ k }}</b-button>
        <b-collapse :id="'collapse-'+k" :visible="k === 'health_check' || expandAll">
          <div v-if="k === 'health_check'" class="container-fluid">
            <BarBPageHeader>
              <template #left>
                <InputIFilterTChanges :placeholder="$t('Filter')" :filter.sync="filter" />
                <b-button
                  size="sm"
                  variant="outline-primary"
                  class="border-0"
                  :pressed.sync="expandHCD"
                >
                  <b-icon v-if="expandHCD" :icon="iconnames.save" />
                  <b-icon v-else />
                  {{ $t('Show Details') }}
                </b-button>
              </template>
            </BarBPageHeader>
            <DivDScrollResult>
              <span v-for="health, i in diagnostic" :key="i" :class="{ 'd-none': !health.check_id.includes(filter) && !health.check_status.includes(filter) }">
                <GridGFormItem value-more="true">
                  <template #label>
                    <b-button v-if="health.partial_results.length !== 0" v-b-toggle="'collapse-'+health.check_id" class="border-0" variant="transparent">{{ $t('>') }}</b-button>
                    <b-button v-else class="border-0" variant="outline-primary" :style="'min-width: 35px !important;'" disabled />
                    <b-badge v-if="health.check_status" :style="'min-width: 70px !important;'" size="sm" :variant="getVariant(health.check_status)">
                      <div class="text-uppercase">
                        {{ health.check_status }}
                      </div>
                    </b-badge>
                  </template>
                  <template #value>
                    <span class="font-weight-bold text-capitalize">{{ health.check_name }}</span>
                  </template>
                  <template #valueMore>
                    {{ health.message }}
                  </template>
                </GridGFormItem>
                <b-collapse :id="'collapse-'+health.check_id" :visible="expandHCD || filter!==''">
                  <span v-for="(data, index) in health.partial_results" :key="index">
                    <GridGFormItem value-more="true">
                      <template #label>
                        <b-button class="border-0" variant="outline-primary" :style="'min-width: 35px !important;'" disabled />
                        <b-badge v-if="data.check_status" :style="'min-width: 70px !important;'" size="sm" :variant="getVariant(data.check_status)">
                          <div class="text-uppercase">
                            {{ data.check_status }}
                          </div>
                        </b-badge>
                      </template>
                      <template #value>
                        <small>{{ data.check_name }}</small>
                      </template>
                      <template #valueMore>
                        <small> {{ data.message }} </small>
                      </template>
                    </GridGFormItem>
                  </span>
                </b-collapse>
                <br>
              </span>
            </DivDScrollResult>
          </div>
          <template v-else>
            <span v-for="val,i in diagnostic" :key="i" :class="{ 'd-none': !i.includes(filter) }">
              <GridGFormItem>
                <template #label>
                  {{ i }}
                </template>
                <template #value>
                  <template v-if="typeof val == 'object'">
                    <div class="scrollValue">
                      <pre>{{ JSON.stringify(val, null, 4) }}</pre>
                    </div>
                  </template>
                  <template v-else>
                    {{ val }}
                  </template>
                </template>
              </GridGFormItem>
            </span>
          </template>
        </b-collapse>
      </span>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
@Component({ mixins: [Constants] })
export default class VHealthCheck extends Vue {
  iconnames: any
  $axios: any
  $t:any
  @Prop({ }) id!: string
  @Prop({ default: false }) 'asChild'!: string
  @Prop({ default: false }) 'closeroute'!: string

  // healthcheckdata: Array<object> = []
  diagnosticdata: Array<object> = []
  errorText: string = ''
  filter: string = ''
  expandAll: boolean = false
  expandHCD: boolean = false
  jsonformat: boolean = false
  diagnostic: boolean = false

  getVariant (status: any) {
    if (status === 'error') { return 'danger' } else if (status === 'ok') { return 'success' } else if (status === 'warning') { return 'warning' } else { return 'primary' }
  }

  togglePartialResults (val, data) {
    for (const item of data) {
      this.$set(item, '_showDetails', val)
    }
  }

  async fetch () {
    // await this.$axios.$get('/api/opsidata/server/health')
    //   .then((response) => {
    //     this.healthcheckdata = response
    //   }).catch((error) => {
    //     const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
    //     const ref = (this.$refs.healthCheckAlert as any)
    //     ref.alert(this.$t('message.error.fetch') as string + 'Health Check', 'danger', detailedError)
    //     this.errorText = this.$t('message.error.defaulttext') as string
    //   })
    await this.fetchDiagnosticData()
  }

  async fetchDiagnosticData () {
    await this.$axios.$get('/api/opsidata/server/diagnostic')
      .then((response) => {
        this.diagnosticdata = response
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.healthCheckAlert as any)
        ref.alert(this.$t('message.error.fetch') as string + 'Health Check', 'danger', detailedError)
        this.errorText = this.$t('message.error.defaulttext') as string
      })
  }

  prettyJSON (data: Object) {
    return JSON.stringify(data, null, 4)
  }

  downloadHealthData () {
    const text = JSON.stringify(this.diagnosticdata)
    const filename = 'healthcheck.json'
    const element = document.createElement('a')
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text))
    element.setAttribute('download', filename)

    element.style.display = 'none'
    document.body.appendChild(element)

    element.click()
    document.body.removeChild(element)
  }
}
</script>
<style scoped>
div.scrollValue {
  max-height: 500px;
  overflow-x: hidden;
  overflow-y: auto;
  /* border:1px solid var(--border, #ced4da ); */
}
</style>
