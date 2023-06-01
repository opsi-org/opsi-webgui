<template>
  <div data-testid="VServerHealthCheck">
    <AlertAAlert ref="healthCheckAlert" />
    <OverlayOLoading :is-loading="$fetchState.pending" />
    <b-tabs>
      <b-tab :title="$t('title.diagnostics')" active>
        <BarBPageHeader>
          <template #left>
            <b-button
              size="sm"
              variant="outline-primary"
              :title="expandAll? $t('button.collapse') : $t('button.expand')"
              :pressed.sync="expandAll"
            >
              <b-icon v-if="expandAll" :icon="icon.arrowDoubleUp" />
              <b-icon v-else :icon="icon.arrowDoubleDown" />
            </b-button>
            <InputIFilterTChanges :placeholder="$t('Filter')" :filter.sync="filter" />
          </template>
          <template #right>
            <div>
              <b-button class="downloadButton border-0" variant="outline-primary" @click="downloadHealthData">
                <b-icon :icon="icon.download" /> {{ $t('Download') }}
              </b-button>
            </div>
          </template>
        </BarBPageHeader>
        <span v-for="diagnostic,k in onlyDiagnostics" :key="k">
          <b-button v-b-toggle="'collapse-'+k" class="text-left font-weight-bold border-0" block variant="outline-primary">
            {{ k }}
          </b-button>
          <b-collapse :id="'collapse-'+k" :visible="expandAll || filter!= ''">
            <span v-for="val,i in diagnostic" :key="i" :class="{ 'd-none': !i.includes(filter) }">
              <GridGFormItem class="ml-3">
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
          </b-collapse>
        </span>
      </b-tab>

      <b-tab :title="$t('title.healthcheck')">
        <ViewVHealthCheck />
      </b-tab>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
@Component({ mixins: [Icons] })
export default class VHealthCheck extends Vue {
  icon: any
  $axios: any
  $t:any

  diagnosticdata: Array<any> = []
  onlyDiagnostics: Array<any> = []
  filter: string = ''
  expandAll: boolean = false

  async fetch () {
    await this.fetchDiagnosticData()
  }

  async fetchDiagnosticData () {
    await this.$axios.$get('/api/opsidata/server/diagnostic')
      .then((response) => {
        this.diagnosticdata = response
        this.onlyDiagnostics = response
        delete this.onlyDiagnostics.health_check
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.healthCheckAlert as any)
        ref.alert(this.$t('message.error.fetch') as string + 'Health Check', 'danger', detailedError)
      })
  }

  downloadHealthData () {
    const text = JSON.stringify(this.diagnosticdata)
    const filename = 'server_diagnostics.json'
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
