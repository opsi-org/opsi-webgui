<template>
  <div>
    <div :id="`TCProductVersionCell_hover_${rowitem.productId}_${type}`">
      <b-badge
        v-if="rowitem.depot_version_diff"
        :class="(rowitem.depot_version_diff||false)?'bg-color-orange':''"
      >
        <span>&#8800;</span>
      </b-badge>
      <b-badge
        v-else
      >
        {{ rowitem.depotVersions[0] }}
      </b-badge>
      <b-badge
        v-if="rowitem.client_version_outdated||false"
        :class="(rowitem.client_version_outdated||false)?'bg-color-red':''"
      >
        *
      </b-badge>
    </div>
    <TooltipTTProductCell
      v-if="rowitem.depot_version_diff || rowitem.client_version_outdated||false"
      type="version"
      :target="`TCProductVersionCell_hover_${rowitem.productId}_${type}`"
      :details="tooltiptext"
      :depot-version-diff="rowitem.depot_version_diff"
    />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { mapValues2Objects } from '~/helpers/hmappings'
import { IObjectString2String, IObjectString2ObjectString2String } from '~/types/tsettings'
import { ITableRowItemProducts } from '~/types/ttable'
const selections = namespace('selections')

@Component
export default class TableCellTCProductVersionCell extends Vue {
  @Prop({ }) rowitem!: ITableRowItemProducts
  @Prop({ }) type!: string
  @Prop({ }) clients2depots!: IObjectString2String

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>

  get tooltiptext () {
    // console.debug('key length: ', Object.keys(this.clients2depots).length)
    const depots: IObjectString2String = mapValues2Objects(this.rowitem.depotVersions, this.rowitem.selectedDepots, this.selectionDepots, '-')
    const tt:IObjectString2ObjectString2String = {}
    for (const d in depots) {
      tt[d] = {
        [d]: depots[d]
      }
    }
    if (Object.keys(this.clients2depots).length <= 0) {
      return tt
    }
    const clients: IObjectString2String = mapValues2Objects(this.rowitem.clientVersions, this.rowitem.selectedClients, this.selectionClients, '-')
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
