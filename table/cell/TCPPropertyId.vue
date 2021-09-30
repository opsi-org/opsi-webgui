<template>
  <div class="TProductProperties_PropertyId_Row">
    <i
      v-if="rowItem.anyDepotDifferentFromDefault"
      :id="`TProductProperties_PropertyId_hover_${rowItem.propertyId}`"
    >
      <!-- (depotValue/s different from default!) -->
      <b v-if="rowItem.anyClientDifferentFromDepot">{{ rowItem.propertyId }}</b>
      {{ (rowItem.anyClientDifferentFromDepot)? '': rowItem.propertyId }}
    </i>
    <p
      v-else
      :id="`TProductProperties_PropertyId_hover_${rowItem.propertyId}`"
    >
      <b v-if="rowItem.anyClientDifferentFromDepot">{{ rowItem.propertyId }}</b>
      {{ (rowItem.anyClientDifferentFromDepot)? '': rowItem.propertyId }}
    </p>

    <TooltipTTTooltip
      variant="dark"
      classes="TCPPropertyId_TT"
      :target="`TProductProperties_PropertyId_hover_${rowItem.propertyId}`">
      <template #tooltip>
        Defaults: <b v-if="rowItem.default!='mixed'">[{{ rowItem.details }}]</b>
        <div v-else>
          <p v-for="v,k in rowItem.defaultDetails" :key="k">
            {{ k }}: <b>{{ v }}</b>
          </p>
        </div>
        <br>
        <div v-if="rowItem.anyDepotDifferentFromDefault">
          Depots:
          <p v-for="v,k in rowItem.depots" :key="k">
            {{ k }}: <b>{{ v }}</b>
          </p>
        </div>
        <br>
        Description: <b v-if="rowItem.description!='mixed'">{{ rowItem.description }}</b>
        <div v-else>
          <p v-for="v,k in rowItem.descriptionDetails" :key="k">
            {{ k }}: <b>{{ v }}</b>
          </p>
        </div>
      </template>
    </TooltipTTTooltip>
    <!-- product on each depot, but property not on every depot-->
    <IconIDetails
      v-if="Object.values(productVersions).filter(n => n).length == selectionDepots.length && Object.keys(rowItem.depots).length!=selectionDepots.length"
      :id="`btn_tt_${rowItem.propertyId}`"
      :title="`product-version only on depots: ${Object.keys(rowItem.depots)}`"
      content="*"
    />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { IObjectString2StringOrUndefined } from '~/types/tsettings'
import { IProperty } from '~/types/ttable'
const selections = namespace('selections')

@Component
export default class TCSpan extends Vue {
  @Prop({ }) rowItem!: IProperty
  @Prop({ }) productVersions!: IObjectString2StringOrUndefined

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
}
</script>

<style>
.TCPPropertyId_TT {
  max-width: 50% !important;
}
.TCPPropertyId_TT  .tooltip-inner {
    text-align: left !important;
}
.TCPPropertyId_TT p {
  margin-left: 10px !important;
  margin-bottom: 0 !important;
}
</style>
