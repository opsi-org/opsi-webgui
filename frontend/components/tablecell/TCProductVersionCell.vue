<template>
  <div data-testid="TCProductVersionCell" class="d-inline-block">
    <div
      :id="`TCProductVersionCell_hover_${rowitem.productId}_${type}`"
      class="TCProductVersionCell_hover text-small"
    >
      {{ (rowitem.depot_version_diff) ? '' : rowitem.depotVersions[0] }}
      <IconIDetails
        v-if="rowitem.depot_version_diff"
        class="details depot-unequal"
        content="depot-unequal"
        :variant="(rowitem.depot_version_diff || false) ? 'warning' : undefined"
        @click="$emit('details', row, tooltiptext)"
      />
      <IconIDetails
        v-if="(rowitem.selectedDepots.length !== selectionDepots.length)"
        :variant="(rowitem.selectedDepots.length !== selectionDepots.length) ? 'warning' : undefined"
        class="details depot-wo-prod"
        content="depot-wo-prod"
      />

      <IconIDetails
        v-if="rowitem.client_version_outdated || false"
        :variant="(rowitem.client_version_outdated || false) ? 'danger' : undefined"
        class="details client-outdated"
        content="client-outdated"
        @click="$emit('details', row, tooltiptext)"
      />
    </div>
    <!-- <TooltipTTProductCell
      v-if="rowitem.depot_version_diff || rowitem.client_version_outdated || (rowitem.selectedDepots.length !== selectionDepots.length) || false"
      type="version"
      :target="`TCProductVersionCell_hover_${rowitem.productId}_${type}`"
      :details="tooltiptext"
      :depot-version-diff="rowitem.depot_version_diff"
    /> -->
  </div>
</template>

<script setup lang="ts">
import type { T_Client2Depot } from '~/types/APItypes';
import type { IObjectString2String, IObjectString2ObjectString2String } from '~/types/tgeneral';
import { mapValues2Objects } from '~/utils/smappings';
// const selStore = storeSelections()
const {selectionDepots, selectionClients} = storeToRefs(storeSelections())

const $emit = defineEmits(['details'])
const props = defineProps({
  row: { type: Object as PropType<any>, required: true },
  type: { type: String, required: true },
  clients2depots: { type: Object as PropType<T_Client2Depot>, required: true }
})
const rowitem = computed(()=>props.row)
const tooltiptext = computed(()=>{
  // console.debug('key length: ', Object.keys(props.clients2depots).length)
  const depots: IObjectString2String = mapValues2Objects(rowitem.value.depotVersions, rowitem.value.selectedDepots, selectionDepots.value, '--')
  const tt:IObjectString2ObjectString2String = {}
  for (const d in depots) {
    tt[d] = {
      [d]: depots[d]
    }
  }
  if (Object.keys(props.clients2depots).length <= 0 || Object.keys(props.clients2depots).length !== selectionClients.value.length) {
    return tt
  }
  const clients: IObjectString2String = mapValues2Objects(
    rowitem.value.clientVersions,
    rowitem.value.selectedClients,
    selectionClients.value, '--')
  for (const c in clients) {
    tt[props.clients2depots[c]][c] = clients[c]
  }
  return tt
})
/*
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { IObjectString2String, IObjectString2ObjectString2String } from '../../../.utils/types/tgeneral'
import { ITableRow, ITableRowItemProducts } from '../../../.utils/types/ttable'
import { mapValues2Objects } from '../../../.utils/utils/smappings'
const selections = namespace('selections')

@Component
export default class TCProductVersionCell extends Vue {
  @Prop({ }) row!: ITableRow
  @Prop({ }) type!: string
  @Prop({ }) clients2depots!: IObjectString2String

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>

  get rowitem (): ITableRowItemProducts { return this.row.item as ITableRowItemProducts }
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
} */
</script>

<style scoped>
/* .version_outdated {
  color:red
}
.TCProductVersionCell_hover {
  width: auto;
  height: auto;
  display: flow-root;
}
.TCProductVersionCell_hover > .details{
  display: flex;
  float: left;
}
.TCProductVersionCell_hover > .details.client-outdated{
  float: right;
} */
</style>
