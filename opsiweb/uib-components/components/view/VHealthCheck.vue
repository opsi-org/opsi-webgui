<template>
  <div data-testid="VHealthCheck">
    <OverlayOLoading :is-loading="$fetchState.pending" />

    <BarBPageHeader>
      <template #left>
        <b-button
          size="sm"
          variant="outline-primary"
          :title="expandHCD? $t('button.collapse') : $t('button.expand')"
          :pressed.sync="expandHCD"
        >
          <small><b-icon :icon="expandHCD? icon.arrowDoubleUp : icon.arrowDoubleDown" /></small>
        </b-button>
        <InputIFilterTChanges :placeholder="$t('Filter')" :filter.sync="filter" />
      </template>
    </BarBPageHeader>
    <DivDScrollResult>
      <span v-for="health, i in healthcheckdata" :key="i" :class="{ 'd-none': health.length >= 0 ? !health.check_id.includes(filter) && !health.check_status.includes(filter) : null }">
        <GridGFormItem value-more="true" classprop="none">
          <template #label>
            <template v-if="health.partial_results.length != 0">
              <b-button v-b-toggle="'collapse-'+health.check_id" class="border-0" size="sm" variant="transparent">
                <small><b-icon :icon="expandHCD? icon.arrowUp : icon.arrowRight" /></small>
              </b-button>
            </template>
            <template v-else>
              <span :style="'width: 34px; min-height: 1px; float: left;'" />
            </template>
            <b-badge v-if="health.check_status" :style="'min-width: 70px !important;'" :variant="getVariant(health.check_status)">
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
            <GridGFormItem value-more="true" classprop="none">
              <template #label>
                <span :style="'width: 34px; min-height: 1px; float: left;'" />
                <b-badge v-if="data.check_status" :style="'min-width: 70px !important;'" :variant="getVariant(data.check_status)">
                  <div class="text-uppercase">
                    {{ data.check_status }}
                  </div>
                </b-badge>
              </template>
              <template #value>
                {{ data.check_name }}
              </template>
              <template #valueMore>
                {{ data.message }}
              </template>
            </GridGFormItem>
          </span>
        </b-collapse>
        <br>
      </span>
    </DivDScrollResult>
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

  healthcheckdata: Array<any> = []
  filter: string = ''
  expandHCD: boolean = false

  getVariant (status: any) {
    if (status === 'error') { return 'danger' } else if (status === 'ok') { return 'success' } else if (status === 'warning') { return 'warning' } else { return 'primary' }
  }

  async fetch () {
    await this.$axios.$get('/api/opsidata/server/health')
      .then((response) => {
        this.healthcheckdata = response
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        const ref = (this.$root.$children[1].$refs.errorAlert as any) || (this.$root.$children[2].$refs.errorAlert as any)
        ref.alert(this.$t('message.error.fetch') as string + 'Health Check', 'danger', detailedError)
      })
  }
}
</script>
