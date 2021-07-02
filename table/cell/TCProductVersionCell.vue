<template>
  <div>
    <div :id="`TCProductVersionCell_hover_${rowitem.productId}_${type}`">
      <div v-if="type=='depotVersions'">
        <b-badge
          v-if="rowitem.depot_version_diff"
          :variant="(rowitem.client_version_outdated||false)?'warning':''"
          style="width:100%"
        >
          !=
        </b-badge>
        <b-badge
          v-else
        >
          {{ rowitem.depotVersions[0] }}
        </b-badge>
      </div>
      <div v-else>
        <b-badge
          v-if="rowitem.client_version_outdated||false"
          :variant="(rowitem.client_version_outdated||false)?'danger':''"
          style="width:100%"
        >
          *
        </b-badge>
      </div>
      <!-- :rowitem="rowitem" -->
      <!-- :detailsDepots="tooltiptext.depots" -->
      <TooltipTTProductCell
        v-if="rowitem.depot_version_diff || rowitem.client_version_outdated||false"
        type="version"
        :target="`TCProductVersionCell_hover_${rowitem.productId}_${type}`"
        :details="tooltiptext"
        :depot-version-diff="rowitem.depot_version_diff"
      />
    </div>
    <!-- {{tooltiptext}} -->
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
  @Prop({ }) type!: string // depotVersions | clientVersions
  // @Prop({ }) rowitem.depotVersions!: Array<string>
  // @Prop({ }) rowitem.clientVersions!: Array<string>
  // @Prop({ }) rowitem.selectedDepots!: Array<string>
  // @Prop({ }) rowitem.selectedClients!: Array<string>
  @Prop({ }) clients2depots!: IObjectString2String

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>

  // get visibleVersions () {
  //   const versionDepots = mapValues2Value(this.rowitem.depotVersions, this.rowitem.selectedDepots, this.selectionDepots)
  //   const versionClients = mapValues2Value(this.rowitem.clientVersions, this.rowitem.selectedClients, this.selectionClients)
  //   return { versionDepots, versionClients }
  // }

  get tooltiptext () {
    const clients: IObjectString2String = mapValues2Objects(this.rowitem.clientVersions, this.rowitem.selectedClients, this.selectionClients, '-')
    const depots: IObjectString2String = mapValues2Objects(this.rowitem.depotVersions, this.rowitem.selectedDepots, this.selectionDepots, '-')
    const tt:IObjectString2ObjectString2String = {}
    for (const d in depots) {
      tt[d] = {
        [d]: depots[d]
      }
    }
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
