<template>
  <div>
    <div
      :id="`TCProductVersionCell_hover_${row.item.productId}_${type}`"
    >
      <b-badge
        v-if="row.item.depot_version_diff"
        :class="(row.item.depot_version_diff||false)?'bg-color-orange':''"
        @click="$emit('details', row, tooltiptext)"
      >
        <span>&#8800;</span>
      </b-badge>
      <b-badge
        v-else
      >
        {{ row.item.depotVersions[0] }}
      </b-badge>
      <b-badge
        v-if="row.item.client_version_outdated||false"
        :class="(row.item.client_version_outdated||false)?'bg-color-red':''"
        @click="$emit('details', row, tooltiptext)"
      >
        *
      </b-badge>
    </div>
    <TooltipTTProductCell
      v-if="row.item.depot_version_diff || row.item.client_version_outdated||false"
      type="version"
      :target="`TCProductVersionCell_hover_${row.item.productId}_${type}`"
      :details="tooltiptext"
      :depot-version-diff="row.item.depot_version_diff"
    />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { mapValues2Objects } from '~/helpers/hmappings'
import { IObjectString2String, IObjectString2ObjectString2String } from '~/types/tsettings'
import { ITableRow, ITableRowItemProducts } from '~/types/ttable'
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
    const depots: IObjectString2String = mapValues2Objects((this.row.item as ITableRowItemProducts).depotVersions, (this.row.item as ITableRowItemProducts).selectedDepots, this.selectionDepots, '-')
    const tt:IObjectString2ObjectString2String = {}
    for (const d in depots) {
      tt[d] = {
        [d]: depots[d]
      }
    }
    if (Object.keys(this.clients2depots).length <= 0) {
      return tt
    }
    const clients: IObjectString2String = mapValues2Objects((this.row.item as ITableRowItemProducts).clientVersions, (this.row.item as ITableRowItemProducts).selectedClients, this.selectionClients, '-')
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
