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
        <InputIFilterTChanges :placeholder="$t('filterBy.Check')" :filter.sync="filter" />
      </template>
    </BarBPageHeader>
    <DivDScrollResult>
      <span
        v-for="health, i in healthcheckdata"
        :key="i"
        :class="{ 'd-none': !health.check_status.toLowerCase().includes(filter.toLowerCase())
          && !health.check_name.toLowerCase().includes(filter.toLowerCase()) }"
      >
        <GridGFormItem value-more="true" :formclass="'mainitem ' + ((health.partial_results.length != 0)? 'collapsable' : '')" variant="shortlabel">
          <template #label>
            <div>
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
            </div>
          </template>
          <template #value>
            <span class="font-weight-bold">{{ health.check_name }}</span>
          </template>
          <template #valueMore>
            <span class="font-weight-bold">{{ health.message }}</span>
          </template>
        </GridGFormItem>
        <b-collapse :id="'collapse-'+health.check_id" :visible="expandHCD || filter!==''">
          <span v-for="(data, index) in health.partial_results" :key="index">
            <GridGFormItem value-more="true" formclass="none" :valuedetails="data.message" variant="shortlabel">
              <template #label>
                <span :style="'width: 34px; min-height: 1px; float: left;'" />
                <b-badge v-if="data.check_status" :style="'min-width: 70px !important;'" :variant="getVariant(data.check_status)">
                  <div class="text-uppercase">
                    {{ data.check_status }}
                  </div>
                </b-badge>
              </template>
              <template #value>
                <b v-if="$mq === 'mobile'" class="text-sm-left text-small">{{ data.check_name }}</b>
                <span v-else class="text-sm-left text-small">{{ data.check_name }}</span>
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
import { AlertToast } from '../../mixins/component'
import { Icons } from '../../mixins/icons'
@Component({ mixins: [Icons, AlertToast] })
export default class VHealthCheck extends Vue {
  showToastError: any // mixin
  icon: any
  $mq: any
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
        this.showToastError(error)
      })
  }
}
</script>
