<template>
  <!-- <b-tooltip v-if="(type=='version' && text)" :target="target" triggers="hover" :variant="variant"> Depot:{{row.item.versionDepot}}</b-tooltip>
  <b-tooltip v-else-if="(type=='ppversion' && text)" :target="target" triggers="hover" :variant="variant"> only on Depot:{{row.item.objectIdsDepots}}</b-tooltip>
  <b-tooltip v-else-if="(type=='productId' && text)" :target="target" triggers="hover" variant="danger">only on: {{row.item.depotId}}</b-tooltip>
  <b-tooltip v-else-if="(type=='installationStatus' && text)" :target="target" triggers="hover" :variant="variant">Status: {{row.item.installationStatus}}</b-tooltip> -->
  <b-tooltip :target="target" triggers="hover" :placement="placement">
    <TableTTooltipContent
      :target="target"
      :details="details"
      :depot-version-diff="depotVersionDiff"
      :variant="variant"
      :type="type"
      :dark="dark"
    />
    <!-- :details-depots="detailsDepots" -->
  </b-tooltip>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { IObjectString2String } from '~/types/tsettings'
// import { ITableRowItemProducts } from '~/types/ttable'

@Component
export default class TTProductCell extends Vue {
  @Prop({ }) target!: string
  @Prop({ }) details!: IObjectString2String
  @Prop({ default: 'bottom' }) placement!: string
  @Prop({ default: 'version' }) type!: string
  @Prop({ default: true }) dark!: boolean
  @Prop({ default: false }) depotVersionDiff?: boolean
  @Prop({ default: 'warning' }) variant!: string
  // @Prop({ }) detailsDepots!: IObjectString2String
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
