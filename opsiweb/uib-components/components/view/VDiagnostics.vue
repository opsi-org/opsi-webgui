<template>
  <div data-testid="VDiagnostics">
    <OverlayOLoading :is-loading="$fetchState.pending" />
    <BarBPageHeader>
      <template #left>
        <b-button
          size="sm"
          variant="outline-primary"
          :title="expandAll? $t('button.collapse') : $t('button.expand')"
          :pressed.sync="expandAll"
        >
          <small><b-icon :icon="expandAll? icon.arrowDoubleUp : icon.arrowDoubleDown" /></small>
        </b-button>
        <InputIFilterTChanges :placeholder="$t('Filter')" :filter.sync="filter" />
      </template>
      <template #right>
        <b-button class="downloadButton" size="sm" variant="outline-primary" @click="downloadHealthData">
          <b-icon :icon="icon.download" /> {{ $t('Download') }}
        </b-button>
      </template>
    </BarBPageHeader>
    <DivDScrollResult>
      <span v-for="diagnostic,k in onlyDiagnostics" :key="k">
        <b-button v-b-toggle="'collapse-'+k" class="text-left font-weight-bold border-0" size="sm" block variant="outline-primary">
          {{ k }}
        </b-button>
        <b-collapse :id="'collapse-'+k" :visible="expandAll || filter!= ''">
          <span v-for="val,i in diagnostic" :key="i" :class="{ 'd-none': !i.toString().includes(filter) }">
            <GridGFormItem class="ml-2" :label="i" variant="longvalue">
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
    </DivDScrollResult>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
@Component({ mixins: [Icons] })
export default class VDiagnostics extends Vue {
  icon: any
  $axios: any
  $t:any

  diagnosticdata: Array<any> = []
  onlyDiagnostics: any = []
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
        if (this.onlyDiagnostics.length !== 0 && this.onlyDiagnostics.health_check) { delete this.onlyDiagnostics.health_check }
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        const ref = (this.$root.$children[1].$refs.errorAlert as any) || (this.$root.$children[2].$refs.errorAlert as any)
        ref.alert(detailedError, 'danger')
      })
  }

  downloadHealthData () {
    const text = JSON.stringify(this.diagnosticdata, null, 2)
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
