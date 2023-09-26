<template>
  <div data-testid="TTooltipContent">
    <!-- TODO: Test style, tootlips with below commented style classes are not visible in production -->
    <b-table-simple small borderless>
      <b-tbody v-if="type=='version'">
        <div v-for="(depotClientDetails, depotId) in details" :key="depotId">
          <BarBTooltipCollapseRow
            :title="depotId"
            :value="depotClientDetails[depotId]"
            :value-variant="((depotVersionDiff || depotClientDetails[depotId]=='--')? 'warning':'info')"
            :collapsed="Object.keys(details).length <= 1"
            :collapseable="Object.keys(depotClientDetails).length > 1"
          >
            <template
              v-if="Object.keys(depotClientDetails).length > 1"
              #nav-child
            >
              <b-tr
                v-for="(clientVersion,clientId) in depotClientDetails"
                :key="clientId"
                :class="`subbadge_${type}_${clientId}`"
                class="tr-subrow"
              >
                <b-th
                  v-if="clientId!=depotId"
                  class="text-left text-small"
                >
                  {{ clientId }}
                </b-th>
                <b-th
                  v-if="clientId!=depotId"
                  class="text-right text-small"
                >
                  <b-badge :variant="(depotClientDetails[depotId]!=clientVersion)?'danger':getVariant(type)">
                    {{ clientVersion }}
                  </b-badge>
                </b-th>
              </b-tr>
            </template>
          </BarBTooltipCollapseRow>
        </div>
      </b-tbody>
      <b-tbody v-else>
        <b-tr v-for="(v,c) in details" :key="c" :class="`badge_${type}_${c}`">
          <b-th class="text-left text-small">
            {{ c }}
          </b-th>
          <b-th class="text-right">
            <b-badge :variant="getVariant(v)">
              {{ v }}
            </b-badge>
            <b-badge v-if="changes && changes[c]" variant="warning">
              {{ changes[c] }}
            </b-badge>
            {{ (changes && changes[c]) ? $t('notOrigin'):'' }}
          </b-th>
        </b-tr>
      </b-tbody>
    </b-table-simple>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { IObjectString2String, IObjectString2Function } from '../../.utils/types/tgeneral'
const changes = namespace('changes')

@Component
export default class TTProductCell extends Vue {
  @Prop({ default: false }) depotVersionDiff?: boolean
  @Prop({ default: 'version' }) type!: string
  @Prop({ default: 'danger' }) variant!: string
  @Prop({ default: false }) dark!: boolean
  @Prop({ }) details!: IObjectString2String
  @Prop({ default: () => { return {} } }) changes?: object
  @changes.Getter public changesProducts!: Array<any>

  variants: IObjectString2Function = {
    actionRequest: (r:string) => {
      if (r === 'uninstall') { return 'info' }
      if (r === 'setup') { return 'danger' }
      if (r === 'update') { return 'danger' }
      if (r === 'always') { return 'danger' }
      if (r === 'once') { return 'danger' }
      if (r === 'custom') { return 'danger' }
      return 'bg-grey'
    },
    installationStatus: (s: string) => {
      if (s === 'installed') { return 'success' }
      if (s === 'unknown') { return 'warning' }
      return 'bg-grey' // not_installed
    },
    actionResult: (s: string) => {
      if (s === 'failed') { return 'danger' }
      if (s === 'successful') { return 'success' }
      return 'bg-grey'
    },
    version: () => 'info'
  }

  getVariant (value: string) {
    if (this.variants[this.type] === undefined) {
      return 'info'
    }
    return this.variants[this.type](value)
  }
}
</script>
<style>
.desktop .tt-table > tbody{
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 30%;
}
.tooltip.b-tooltip {
  opacity: 1 !important;
}
.tt-table,
.tt-table th {
  background-color: var(--bg-tooltip_inner_table) !important;
}
.tooltip-inner {
  max-width: inherit !important;
  max-height: 250px;
  overflow: auto;
  }
.tt-table .nav-item {
  display: inherit !important;
}
.tt-table .nav-item .nav-link {
  display: contents !important;
}
.not_bold{
  font-weight: 100 !important;
}
.pps_client_uneq_depot{
  font-weight: bold !important;
}
.tooltip-inner-badge-text-size{
  font-size: inherit !important;
}
</style>
