<template>
  <div class="TProductProperties_PropertyId_Row">
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
      class="TProductProperties_Property_p"
    >
      <b v-if="row.item.anyClientDifferentFromDepot">{{ row.item.propertyId }}</b>
      {{ (row.item.anyClientDifferentFromDepot)? '': row.item.propertyId }}
    </p>
    <IconIDetails
      v-if="Object.values(productVersions).filter(n => n).length == selectionDepots.length && Object.keys(row.item.depots).length!=selectionDepots.length"
      :id="`btn_tt_${row.item.propertyId}`"
      :title="$t('label.ppId-onlyOnDepots', {depots: Object.keys(row.item.depots) })"
      content="ppid-not-exists-on-depot"
    />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { IObjectString2StringOrUndefined } from '../../../.utils/types/tgeneral'
import { ITableRowProperty } from '../../../.utils/types/ttable'
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
.TProductProperties_Property_p {
  margin-block-end: 0px;
}
.mobile .TProductProperties_PropertyId_Row {
  width: max-content;
  max-width: 300px;
  word-break: break-all;
  display: flex;
}
.TProductProperties_PropertyId_Row {
  width: max-content;
  max-width: 200px;
  word-break: break-all;
  display: flex;
}
</style>
