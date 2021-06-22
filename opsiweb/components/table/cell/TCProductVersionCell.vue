<template>
  <div :id="`TCProductVersionCell_hover_${rowid}`">
    <b-badge v-if="visibleVersions.versionDepots =='mixed'">
      !=
    </b-badge>
    <b-badge v-else-if="visibleVersions.versionDepots !=='mixed'">
      {{ visibleVersions.versionDepots }}
    </b-badge>
    <b-badge
      v-if="visibleVersions.versionClients =='mixed'"
    >
      <!-- :variant="(Object.values(tooltiptext).some(e => e. != visibleVersions.versionDepots)) ? 'danger':''" -->
      *
    </b-badge>
    <!-- {{tooltiptext}} -->
    <TooltipTTProductCell
      v-if="visibleVersions.versionDepots == 'mixed' || visibleVersions.versionClients == 'mixed'"
      type="version"
      :target="`TCProductVersionCell_hover_${rowid}`"
      :details="tooltiptext"
    />
    <!-- :detailsDepots="tooltiptext.depots" -->
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { mapValues2Value, mapValues2Objects } from '~/helpers/hmappings'
import { IObjectString2String, IObjectString2ObjectString2String } from '~/types/tsettings'
const selections = namespace('selections')

@Component
export default class TableCellTCProductVersionCell extends Vue {
  @Prop({ }) rowid!: string
  @Prop({ }) valuesDepots!: Array<string>
  @Prop({ }) valuesClients!: Array<string>
  @Prop({ }) objectsDepots!: Array<string>
  @Prop({ }) objectsClients!: Array<string>
  @Prop({ }) clients2depots!: IObjectString2String

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>

  get visibleVersions () {
    const versionDepots = mapValues2Value(this.valuesDepots, this.objectsDepots, this.selectionDepots)
    const versionClients = mapValues2Value(this.valuesClients, this.objectsClients, this.selectionClients)
    return { versionDepots, versionClients }
  }

  get tooltiptext () {
    const clients: IObjectString2String = mapValues2Objects(this.valuesClients, this.objectsClients, this.selectionClients, '-')
    const depots: IObjectString2String = mapValues2Objects(this.valuesDepots, this.objectsDepots, this.selectionDepots, '-')
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

</style>
