<template>
  <div data-testid="GCProductPropertyId">
    <i v-if="row.anyDepotDifferentFromDefault" :id="`TProductProperties_PropertyId_hover_${row.propertyId}`">
      <b v-if="row.anyClientDifferentFromDepot">{{ row.propertyId }}</b>
      {{ row.anyClientDifferentFromDepot ? '' : row.propertyId }}
    </i>
    <div v-else :id="`TProductProperties_PropertyId_hover_${row.propertyId}`" class="TProductProperties_Property_p">
      <b v-if="row.anyClientDifferentFromDepot">{{ row.propertyId }}</b>
      {{ row.anyClientDifferentFromDepot ? '' : row.propertyId }}
    </div>
    <IconIDetails
      v-if="
        Object.values(productVersions).filter(n => n).length == selectionDepots.length &&
        Object.keys(row.depots).length != selectionDepots.length
      "
      :id="`btn_tt_${row.propertyId}`"
      :title="$t('label.ppId-onlyOnDepots', { depots: Object.keys(row.depots) })"
      content="ppid-not-exists-on-depot"
    />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { IObjectString2StringOrUndefined } from '../../../.utils/types/tgeneral'
const selections = namespace('selections')

@Component
export default class GCProductPropertyId extends Vue {
@Prop({}) row!: any
@Prop({}) productVersions!: IObjectString2StringOrUndefined

@selections.Getter public selectionDepots!: Array<string>
@selections.Getter public selectionClients!: Array<string>
}
</script>

<style>
  .TProductProperties_Property_p {
    margin-block-end: 0px;
  }
</style>
