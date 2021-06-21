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
      :variant="(Object.values(tooltiptext.clients).some(e => e != visibleVersions.versionDepots)) ? 'danger':''"
    >
      *
    </b-badge>
    <TooltipTTProductCell
      type="version"
      :target="`TCProductVersionCell_hover_${rowid}`"
      :details="{...tooltiptext.depots, ...tooltiptext.clients}"
    />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { mapValues2Value, mapValues2Objects } from '~/helpers/htable'
const selections = namespace('selections')

@Component
export default class TableCellTCProductVersionCell extends Vue {
  @Prop({ }) rowid!: string
  @Prop({ }) valuesDepots!: Array<string>
  @Prop({ }) valuesClients!: Array<string>
  @Prop({ }) objectsDepots!: Array<string>
  @Prop({ }) objectsClients!: Array<string>

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>

  get visibleVersions () {
    const versionDepots = mapValues2Value(this.valuesDepots, this.objectsDepots, this.selectionDepots)
    const versionClients = mapValues2Value(this.valuesClients, this.objectsClients, this.selectionClients)
    return { versionDepots, versionClients }
  }

  get tooltiptext () {
    return {
      depots: mapValues2Objects(this.valuesDepots, this.objectsDepots, this.selectionDepots, '-'),
      clients: mapValues2Objects(this.valuesClients, this.objectsClients, this.selectionClients, '-')
    }
  }
}
</script>

<style scoped>

</style>
