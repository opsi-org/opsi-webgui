<template>
  <div>
    <div
      :id="`TCProductVersionCell_hover_${row.item.productId}_${type}`"
    >
      <IconIDetails
        v-if="row.item.depot_version_diff"
        content="unequal"
        :variant="(row.item.depot_version_diff||false)?'warning':''"
        @click="$emit('details', row, tooltiptext)"
      />
      {{ (row.item.depot_version_diff)? '' : row.item.depotVersions[0] }}
      <IconIDetails
        v-if="(row.item.selectedDepots.length != selectionDepots.length)"
        :variant="(row.item.selectedDepots.length != selectionDepots.length)?'warning':''"
      />
      <IconIDetails
        v-if="row.item.client_version_outdated||false"
        :variant="(row.item.client_version_outdated||false)?'danger':''"
        @click="$emit('details', row, tooltiptext)"
      />
    </div>
    <TooltipTTProductCell
      v-if="row.item.depot_version_diff || row.item.client_version_outdated||(row.item.selectedDepots.length != selectionDepots.length)||false"
      type="version"
      :target="`TCProductVersionCell_hover_${row.item.productId}_${type}`"
      :details="tooltiptext"
      :depot-version-diff="row.item.depot_version_diff"
    />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { mapValues2Objects } from '@/.utils/utils/smappings'
import { IObjectString2String, IObjectString2ObjectString2String } from '@/.utils/types/tgeneral'
import { ITableRow, ITableRowItemProducts } from '@/.utils/types/ttable'
const selections = namespace('selections')

@Component
export default class TableCellTCProductVersionCell extends Vue {
  @Prop({ }) row!: ITableRow
  @Prop({ }) type!: string
  @Prop({ }) clients2depots!: IObjectString2String

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>

  get tooltiptext () {
    // console.debug('key length: ', Object.keys(this.clients2depots).length)
    const depots: IObjectString2String = mapValues2Objects((this.row.item as ITableRowItemProducts).depotVersions, (this.row.item as ITableRowItemProducts).selectedDepots, this.selectionDepots, '--')
    const tt:IObjectString2ObjectString2String = {}
    for (const d in depots) {
      tt[d] = {
        [d]: depots[d]
      }
    }
    if (Object.keys(this.clients2depots).length <= 0 || Object.keys(this.clients2depots).length !== this.selectionClients.length) {
      return tt
    }
    const clients: IObjectString2String = mapValues2Objects(
      (this.row.item as ITableRowItemProducts).clientVersions,
      (this.row.item as ITableRowItemProducts).selectedClients,
      this.selectionClients, '--')
    for (const c in clients) {
      tt[this.clients2depots[c]][c] = clients[c]
    }
    return tt
  }
}
</script>

<style scoped>
.version_outdated {
  color:red
}
</style>
