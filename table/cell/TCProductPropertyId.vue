<template>
  <div class="TProductProperties_PropertyId_Row">
    <!-- <CollapseCContent :id="'pp_row-'+row.item.propertyId" :bold="false">
      <template #left> -->
    <ButtonBTNInfo aria-label="information about property" :click="row.toggleDetails" />
    <i
      v-if="row.item.anyDepotDifferentFromDefault"
      :id="`TProductProperties_PropertyId_hover_${row.item.propertyId}`"
    >
      <!-- (depotValue/s different from default!) -->
      <b v-if="row.item.anyClientDifferentFromDepot">{{ row.item.propertyId }}</b>
      {{ (row.item.anyClientDifferentFromDepot)? '': row.item.propertyId }}
    </i>
    <p
      v-else
      :id="`TProductProperties_PropertyId_hover_${row.item.propertyId}`"
    >
      <b v-if="row.item.anyClientDifferentFromDepot">{{ row.item.propertyId }}</b>
      {{ (row.item.anyClientDifferentFromDepot)? '': row.item.propertyId }}
    </p>
    <IconIDetails
      v-if="Object.values(productVersions).filter(n => n).length == selectionDepots.length && Object.keys(row.item.depots).length!=selectionDepots.length"
      :id="`btn_tt_${row.item.propertyId}`"
      :title="`product-version only on depots: ${Object.keys(row.item.depots)}`"
      content="*"
    />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { IObjectString2StringOrUndefined } from 'uib-components/.utils/types/tgeneral'
import { ITableRowProperty } from 'uib-components/.utils/types/ttable'
const selections = namespace('selections')

@Component
export default class TCProductPropertyId extends Vue {
  @Prop({ }) row!: ITableRowProperty
  @Prop({ }) productVersions!: IObjectString2StringOrUndefined

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
}
</script>

<style>
</style>
