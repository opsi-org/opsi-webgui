<template>
  <div data-testid="TTooltipContent">
    <!-- TODO: Test style, tootlips with below commented style classes are not visible in production -->
    <!-- :dark="dark" class="tt-table" -->
    <b-table-simple small borderless>
      <b-tbody v-if="type=='version'">
        <div v-for="(depotClientDetails, depotId) in details" :key="depotId">
          <!-- {{depotClientDetails}}, {{depotId}} -->
          <BarBTooltipCollapseRow
            :title="depotId"
            :value="depotClientDetails[depotId]"
            :collapsed="Object.keys(details).length <= 1"
            :collapseable="Object.keys(depotClientDetails).length > 1"
            :value-variant="(depotVersionDiff || depotClientDetails[depotId]=='--')? 'warning':'info'"
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
          <b-th class="text-left">
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
// import { ITableRowItemProducts } from '~/types/ttable'

@Component
export default class TTProductCell extends Vue {
  @Prop({ default: false }) depotVersionDiff?: boolean
  @Prop({ default: 'version' }) type!: string
  @Prop({ default: 'danger' }) variant!: string
  @Prop({ default: false }) dark!: boolean
  @Prop({ }) details!: IObjectString2String
  @Prop({ default: () => { return {} } }) changes?: object
  // @Prop({ }) detailsDepots!: IObjectString2String
  // @Prop({ }) rowitem?: ITableRowItemProducts
  // @Prop({ }) row:Object,
  // @Prop({ }) text!: {type:Boolean, default:false},
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
    // version:(v)=> (v!=this.row.item.versionDepot && v!='None')?'bg-danger':'bg-dark',
    // ppversion:(v:string)=> {v.startsWith('*')? 'pps_client_uneq_depot':'not_bold'},
  }

  // mounted () {
  //   let changesList = this.changesProducts.filter(e => e.property === this.rowItem.propertyId)
  //   changesList = changesList.filter(e => e.user === this.username)
  //   changesList = changesList.filter(e => selectionHosts.includes(e[key]))
  // }

  getVariant (value: string) {
    if (this.variants[this.type] === undefined) {
      // console.error(`Type ${this.type} not in variants`)
      return 'info'
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
.tooltip.b-tooltip {
  opacity: 0.95 !important;
}
.tt-table,
.tt-table th {
  background: var(--light) !important;
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
