<template>
  <b-table-simple small :dark="dark" class="tt-table">
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
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { IObjectString2String, IObjectString2Function } from '~/types/tsettings'
// import { ITableRowItemProducts } from '~/types/ttable'

@Component
export default class TTProductCell extends Vue {
  @Prop({ default: false }) depotVersionDiff?: boolean
  @Prop({ default: 'version' }) type!: string
  @Prop({ default: 'danger' }) variant!: string
  @Prop({ default: false }) dark!: boolean
  @Prop({ }) details!: IObjectString2String
  // @Prop({ }) detailsDepots!: IObjectString2String
  // @Prop({ }) rowitem?: ITableRowItemProducts
  // @Prop({ }) row:Object,
  // @Prop({ }) text!: {type:Boolean, default:false},
  variants: IObjectString2Function = {
    actionRequest: (r:string) => {
      if (r === 'uninstall') { return 'bg-blue' }
      if (r === 'setup') { return 'bg-red' }
      if (r === 'update') { return 'bg-red' }
      if (r === 'always') { return 'bg-red' }
      if (r === 'once') { return 'bg-red' }
      if (r === 'custom') { return 'bg-red' }
      return 'bg-grey'
    },
    installationStatus: (s: string) => {
      if (s === 'installed') { return 'bg-green' }
      if (s === 'unknown') { return 'bg-orange' }
      return 'bg-grey' // not_installed
    },
    actionResult: (s: string) => {
      if (s === 'failed') { return 'bg-red' }
      if (s === 'successful') { return 'bg-green' }
      return 'bg-grey'
    },
    version: () => 'red'
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
.desktop .tt-table > tbody{
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 30%;
}
.tt-table,
.tt-table th {
  background-color: transparent !important;
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
