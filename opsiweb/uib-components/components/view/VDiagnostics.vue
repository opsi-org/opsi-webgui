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
        <InputIFilterTChanges :placeholder="$t('input.filter')" :filter.sync="filter" />
      </template>
      <template #right>
        <b-button class="downloadButton" size="sm" variant="outline-primary" @click="downloadHealthData">
          <b-icon :icon="icon.download" /> {{ $t('button.download') }}
        </b-button>
      </template>
    </BarBPageHeader>
    <DivDScrollResult>
      <span v-for="diagnostic,k in onlyDiagnostics" :key="k">
        <b-button v-b-toggle="'collapse-'+k" class="text-left font-weight-bold border-0" size="sm" block variant="outline-primary">
          {{ k }}
        </b-button>
        <b-collapse :id="'collapse-'+k" :visible="expandAll || filter!= ''">
          <GridGFormItem v-if="Object.keys(diagnostic).length === 0" class="ml-2" :label="$t('---')" variant="longvalue" />
          <template v-else>
            <span
              v-for="value,attribute in diagnostic"
              :key="attribute"
              :class="{ 'd-none': !attribute.toString().toLowerCase().includes(filter.toLowerCase()) }"
            >
              <GridGFormItem class="ml-2" :label="attribute" variant="longvalue">
                <template #value>
                  <template v-if="typeof value == 'object'">
                    <div class="scrollValue">
                      <pre>{{ JSON.stringify(value, null, 4) }}</pre>
                    </div>
                  </template>
                  <template v-else>
                    {{ value }}
                  </template>
                </template>
              </GridGFormItem>
            </span>
          </template>
        </b-collapse>
      </span>
    </DivDScrollResult>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { AlertToast } from '../../mixins/component'
import { Icons } from '../../mixins/icons'
@Component({ mixins: [Icons, AlertToast] })
export default class VDiagnostics extends Vue {
  showToastError: any
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
        this.showToastError(error)
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
