<template>
  TODO:selection is not available now
  <el-checkbox-group>
    <div v-for="item in depotIDList" :key="item">
      <el-checkbox size="small" :label="item" />
    </div>
  </el-checkbox-group>
  <!-- <LazyTreeTSDefault
    v-if="fetchDepotData"
    v-bind="$props"
    id="Depots"
    :text="$t('title.depots')"
    :class="classes"
    :type="type"
    :always-open="open"
    data-testid="TSDepots"
    :lazy-load="true"
    :show-as-multi="multi"
    :text-no-result="$t('treeselect.noresult')"
    :selection-default="selectionDepots"
    :editable="false"
    :is-list="true"
    :fetch-data="fetchDepotData"
    @change="changeSelection"
  /> -->
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDepot } from '~/composables/mixins/useGet';
const options = ref<Array<any>>([])
const depotIDList = ref<Array<any>>([])
// const data:any = []
onMounted(async ()=> {
  await fetch()
})
async function fetch() {
  depotIDList.value = await useDepot().getDepotIdList()
}
// export default class TSDepots extends Vue {
//   @selections.Getter public selectionDepots!: Array<string>
//   @selections.Getter public selectionClients!: Array<string>
//   @selections.Mutation public setSelectionClients!: (s: Array<string>) => void
//   @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void
//   fetchedDataClients2Depots: IObjectString2String = {}

//   @Watch('selectionClients', { deep: true }) async clientsChanged () {
//     if (this.selectionClients.length <= 0) {
//       this.fetchedDataClients2Depots = {}
//     } else {
//       await this.getClientToDepot(this.selectionClients)
//     }
//   }

//   @Watch('selectionDepots', { deep: true }) depotsChanged () {
//     const selectedClientsOnDepots = Object.fromEntries(Object.entries(this.fetchedDataClients2Depots).filter(
//       ([_, value]) => this.selectionDepots.includes(value)
//     ))
//     this.setSelectionClients(Object.keys(selectedClientsOnDepots))
//   }

//   async fetchDepotData () {
//     return await this.getDepotIdList()
//   }

//   changeSelection (selection: Event) {
//     if (selection === undefined) { return }
//     if (!Array.isArray(selection)) { return }

//     if (selection.length > 0) {
//       this.setSelectionDepots([...selection])
//     } else {
//       this.setSelectionDepots([])
//     }
//   }
// }
</script>
