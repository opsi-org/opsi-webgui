<template>
  <div data-testid="VHealthCheck" class="VHealthCheck">
    <AlertAAlert ref="healthCheckAlert" />
    <OverlayOLoading :is-loading="$fetchState.pending" />
    <BarBPageHeader>
      <template v-if="!jsonformat" #left>
        <!-- <InputIFilterTChanges v-if="healthcheckdata" :placeholder="$t('Filter')" :filter.sync="filter" />
        <b-button
          size="sm"
          variant="outline-primary"
          class="border-0"
          @click="togglePartialResults(expandAll = !expandAll)"
        >
          <b-icon v-if="expandAll" :icon="iconnames.save" />
          <b-icon v-else />
          {{ $t('Show Details') }}
        </b-button> -->
      </template>
      <template #right>
        <div v-if="diagnosticdata">
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
      <LazyDivDScrollResult v-if="diagnosticdata">
        <span v-for="v,k in diagnosticdata" :key="k">
          <b-button v-b-toggle="'collapse-'+k" class="text-left font-weight-bold border-0" block variant="outline-primary">{{ k }}</b-button>
          <b-collapse :id="'collapse-'+k" :visible="filter === '' ? false : true">
            <template v-if="k === 'health_check'">
              <b-table
                thead-class="hide"
                borderless
                :items="v"
              >
                <template #cell(partial_results)="row">
                  <div>
                    <b-button
                      v-if="row.item.partial_results.length !== 0"
                      v-b-tooltip.hover
                      size="sm"
                      :style="'min-width: 30px !important;'"
                      variant="transparent"
                      :title="row.detailsShowing ? $t('Hide Details') : $t('Show Details')"
                      @click="row.toggleDetails"
                    >
                      <b-icon v-if="row.detailsShowing" font-scale="0.8" :icon="iconnames.arrowFillUp" />
                      <b-icon v-else font-scale="0.8" :icon="iconnames.arrowFillDown" />
                    </b-button>
                    <b-button
                      v-else
                      disabled
                      :style="'min-width: 30px !important;'"
                      class="border-0"
                      variant="transparent"
                    >
                      {{ $t('') }}
                    </b-button>
                    <b-badge :style="'min-width: 70px !important;'" size="sm" :variant="getVariant(row.item.check_status)">
                      <div class="text-uppercase">
                        {{ row.item.check_status }}
                      </div>
                    </b-badge>
                    <small><span class="font-weight-bold">
                      {{ row.item.check_name }}
                    </span></small>
                  </div>
                </template>
                <template #cell()="row">
                  <small>{{ row.value }}</small>
                </template>
                <template #row-details="row">
                  <b-table
                    thead-class="hide"
                    small
                    fixed
                    hover
                    :filter="filter"
                    :filter-included-fields="['check_status', 'check_name', 'message', 'upgrade_issue']"
                    :items="row.item.partial_results"
                    :fields="['check_status', 'check_name', 'message', 'upgrade_issue']"
                  >
                    <template #cell(check_status)="data">
                      <b-badge size="sm" :variant="getVariant(data.item.check_status)">
                        <div class="text-uppercase">
                          {{ data.item.check_status }}
                        </div>
                      </b-badge>
                    </template>
                    <template #cell(message)="data">
                      <div v-b-tooltip.hover :title="data.item.details ? JSON.stringify(data.item.details) : ''">
                        <small>{{ data.item.message }}</small>
                      </div>
                    </template>
                    <template #cell(upgrade_issue)="data">
                      <small><span v-if="data.item.upgrade_issue" class="font-weight-bold">{{ $t('Upgrade Issue:') }}</span> {{ data.item.upgrade_issue }}</small>
                    </template>
                    <template #cell()="data">
                      <small>{{ data.value }}</small>
                    </template>
                  </b-table>
                </template>
              </b-table>
            </template>
            <template v-else>
              <span v-for="v2,k2 in v" :key="k2">
                <GridGFormItem>
                  <template #label>
                    {{ k2 }}
                  </template>
                  <template #value>
                    <template v-if="typeof v2 == 'object'">
                      <pre>{{ JSON.stringify(v2, null, 4) }}</pre>
                    </template>
                    <template v-else>
                      {{ v2 }}
                    </template>
                  </template>
                </GridGFormItem>
              </span>
            </template>
          </b-collapse>
        </span>
      </LazyDivDScrollResult>
      <DivDScrollResult v-else>
        {{ $t('empty') }}
      </DivDScrollResult>
      <!-- <b-table
        thead-class="hide"
        borderless
        :filter="filter"
        :filter-included-fields="['check_status', 'check_name', 'partial_results', 'message']"
        :items="healthcheckdata"
        :fields="['partial_results', 'message']"
      >
        <template #cell(partial_results)="row">
          <div>
            <b-button
              v-if="row.item.partial_results.length !== 0"
              v-b-tooltip.hover
              size="sm"
              :style="'min-width: 30px !important;'"
              variant="transparent"
              :title="row.detailsShowing ? $t('Hide Details') : $t('Show Details')"
              @click="row.toggleDetails"
            >
              <b-icon v-if="row.detailsShowing" font-scale="0.8" :icon="iconnames.arrowFillUp" />
              <b-icon v-else font-scale="0.8" :icon="iconnames.arrowFillDown" />
            </b-button>
            <b-button
              v-else
              disabled
              :style="'min-width: 30px !important;'"
              class="border-0"
              variant="transparent"
            >
              {{ $t('') }}
            </b-button>
            <b-badge :style="'min-width: 70px !important;'" size="sm" :variant="getVariant(row.item.check_status)">
              <div class="text-uppercase">
                {{ row.item.check_status }}
              </div>
            </b-badge>
            <small><span class="font-weight-bold">
              {{ row.item.check_name }}
            </span></small>
          </div>
        </template>
        <template #cell()="row">
          <small>{{ row.value }}</small>
        </template>
        <template #row-details="row">
          <b-table
            thead-class="hide"
            small
            fixed
            hover
            :filter="filter"
            :filter-included-fields="['check_status', 'check_name', 'message', 'upgrade_issue']"
            :items="row.item.partial_results"
            :fields="['check_status', 'check_name', 'message', 'upgrade_issue']"
          >
            <template #cell(check_status)="data">
              <b-badge size="sm" :variant="getVariant(data.item.check_status)">
                <div class="text-uppercase">
                  {{ data.item.check_status }}
                </div>
              </b-badge>
            </template>
            <template #cell(message)="data">
              <div v-b-tooltip.hover :title="data.item.details ? JSON.stringify(data.item.details) : ''">
                <small>{{ data.item.message }}</small>
              </div>
            </template>
            <template #cell(upgrade_issue)="data">
              <small><span v-if="data.item.upgrade_issue" class="font-weight-bold">{{ $t('Upgrade Issue:') }}</span> {{ data.item.upgrade_issue }}</small>
            </template>
            <template #cell()="data">
              <small>{{ data.value }}</small>
            </template>
          </b-table>
        </template>
      </b-table> -->
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
  jsonformat: boolean = false
  diagnostic: boolean = false

  getVariant (status: string) {
    if (status === 'error') { return 'danger' } else if (status === 'ok') { return 'success' } else if (status === 'warning') { return 'warning' } else { return 'primary' }
  }

  // togglePartialResults (val) {
  //   for (const item of this.healthcheckdata) {
  //     this.$set(item, '_showDetails', val)
  //   }
  // }

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
