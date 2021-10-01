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
    <!-- </template> -->
    <!-- <template #content>

      </template> -->
    <!-- </CollapseCContent> -->
    <!-- <TooltipTTTooltip
      variant="dark"
      triggers="click"
      classes="TCPPropertyId_TT"
      :target="`TProductProperties_PropertyId_hover_${row.item.propertyId}`"
    >
      <template #tooltip>
        Defaults: <b v-if="row.item.default!='mixed'">[{{ row.item.details }}]</b>
        <div v-else>
          <p v-for="v,k in row.item.defaultDetails" :key="k">
            {{ k }}: <b>{{ v }}</b>
          </p>
        </div>
        <br>
        <div v-if="row.item.anyDepotDifferentFromDefault">
          Depots:
          <p v-for="v,k in row.item.depots" :key="k">
            {{ k }}: <b>{{ v }}</b>
          </p>
        </div>
        <br>
        Description: <b v-if="row.item.description!='mixed'">{{ row.item.description }}</b>
        <div v-else>
          <p v-for="v,k in row.item.descriptionDetails" :key="k">
            {{ k }}: <b>{{ v }}</b>
          </p>
        </div>
      </template>
    </TooltipTTTooltip> -->
    <!-- product on each depot, but property not on every depot-->
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { IObjectString2StringOrUndefined } from '~/types/tsettings'
import { ITableRowProperty } from '~/types/ttable'
const selections = namespace('selections')

@Component
export default class TCSpan extends Vue {
  @Prop({ }) row!: ITableRowProperty
  @Prop({ }) productVersions!: IObjectString2StringOrUndefined

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
}
</script>

<style>
/* .TCPPropertyId_TT {
  max-width: 50% !important;
  width: auto !important;
}
.TCPPropertyId_TT  .tooltip-inner {
    text-align: left !important;
    text-align: left !important;
    width: inherit;
    max-width: 300px !important;
    word-wrap: inherit;
    min-width: inherit !important;
}
.TCPPropertyId_TT p {
  margin-left: 10px !important;
  margin-bottom: 0 !important;
} */
/* [id^='pp_row-'] {
  max-width: 100px;
  overflow: visible;
} */
</style>
