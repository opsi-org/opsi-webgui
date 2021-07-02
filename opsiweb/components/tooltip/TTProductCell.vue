<template>
  <!-- <b-tooltip v-if="(type=='version' && text)" :target="target" triggers="hover" :variant="variant"> Depot:{{row.item.versionDepot}}</b-tooltip>
  <b-tooltip v-else-if="(type=='ppversion' && text)" :target="target" triggers="hover" :variant="variant"> only on Depot:{{row.item.objectIdsDepots}}</b-tooltip>
  <b-tooltip v-else-if="(type=='productId' && text)" :target="target" triggers="hover" variant="danger">only on: {{row.item.depotId}}</b-tooltip>
  <b-tooltip v-else-if="(type=='installationStatus' && text)" :target="target" triggers="hover" :variant="variant">Status: {{row.item.installationStatus}}</b-tooltip> -->
  <b-tooltip :target="target" triggers="hover">
    <b-table-simple small dark class="tt-table">
      <b-tbody v-if="type=='version'">
        <div v-for="(depotClientDetails, depotId) in details" :key="depotId">
          <!-- {{depotClientDetails}}, {{depotId}} -->
          <BarBTooltipCollapseRow
            :title="depotId"
            :value="depotClientDetails[depotId]"
            :collapsed="Object.keys(details).length <= 1"
            :collapseable="Object.keys(depotClientDetails).length > 1"
            :value-variant="(depotVersionDiff)? 'warning':''"
          >
            <!-- :collapsed="Object.keys(depotClientDetails) > 1" -->
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
                  class="text-left"
                >
                  {{ clientId }}
                </b-th>
                <b-th
                  v-if="clientId!=depotId"
                  class="text-right"
                >
                  <b-badge :variant="(depotClientDetails[depotId]!=clientVersion)?'danger':''">
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
          <b-th class="text-left">
            {{ c }}
          </b-th>
          <b-th class="text-right">
            <b-badge :class="getVariant(v)">
              {{ v }}
            </b-badge>
          </b-th>
        </b-tr>
      </b-tbody>
    </b-table-simple>
  </b-tooltip>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { IObjectString2String, IObjectString2Function } from '~/types/tsettings'
// import { ITableRowItemProducts } from '~/types/ttable'

@Component
export default class TTProductCell extends Vue {
  @Prop({ }) target!: string
  @Prop({ default: false }) depotVersionDiff?: boolean
  @Prop({ default: 'version' }) type!: string
  @Prop({ default: 'danger' }) variant!: string
  @Prop({ }) details!: IObjectString2String
  @Prop({ }) detailsDepots!: IObjectString2String
  // @Prop({ }) rowitem?: ITableRowItemProducts
  // @Prop({ }) row:Object,
  // @Prop({ }) text!: {type:Boolean, default:false},
  variants: IObjectString2Function = {
    actionRequest: (r:string) => {
      if (r === 'uninstall') { return 'bg-danger' }
      if (r === 'setup') { return 'bg-primary' }
      if (r === 'update') { return 'bg-primary' }
      if (r === 'always') { return 'bg-info' }
      if (r === 'once') { return 'bg-info' }
      if (r === 'custom') { return 'bg-info' }
      return 'bg-secondary'
    },
    installationStatus: (s: string) => {
      if (s === 'installed') { return 'bg-success' }
      if (s === 'unknown') { return 'bg-primary' }
      return 'bg-secondary'
    },
    version: () => 'danger'
    // version:(v)=> (v!=this.row.item.versionDepot && v!='None')?'bg-danger':'bg-dark',
    // ppversion:(v:string)=> {v.startsWith('*')? 'pps_client_uneq_depot':'not_bold'},
  }

  getVariant (value: string) {
    if (this.variants[this.type] === undefined) {
      // console.error(`Type ${this.type} not in variants`)
      return ''
    }
    // return (v) => {
    // console.error(`Variants for ${this.type}`, variants[this.type](value))
    return this.variants[this.type](value)
    // }
  }
}
</script>
<style>
/* .tr-subrow{
  margin-left: 30px;
} */
.tt-table,
.tt-table th {
  background-color: transparent !important;
}
.tooltip-inner {
  max-width: inherit !important;
  max-height: 250px;
  overflow: auto;
  }
/* .badge_installationStatus_not_installed:nth-child(1n+2) { */
  /* border: 1px solid purple !important; */
/* } */
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
