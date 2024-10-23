<template>
  <div>
    <el-select
      v-model="visibleRequest"
      :disabled="config.read_only"
    >
      <el-option
        v-for="a in get_options"
        :key="a"
        :label="a"
        :value="a"
        :data-testid="`DropdownDDProductRequest-Item-${a}`"
        @click="save(rowitem, a); visibleRequest=a; "
      />
      <template #label="{label}">
        <el-text :type="currentReq != preRequest ? 'danger': ''">
          {{ label }} {{ (currentReq != preRequest)? t_fixed('notOrigin'): '' }}
        </el-text>
      </template>
    </el-select>
    <!-- <b-dropdown
      :id="(rowitem!=undefined) ? `DDProductRequest_actionRequest_hover_${rowitem.productId}`:''"
      data-testid="DropdownDDProductRequest"
      v-bind="$props"
      no-caret
      lazy
      dropdown
      :disabled="config?.read_only"
      variant="outline-primary"
      size="sm"
      alt="Show column"
      class="DDProdRequest fixed_column_selection widthmax"
      :class="rowIsSelected? 'selected' : ''"
    >
      <template #button-content>
        <span :class="{'value-changed-not-saved' : currentReq != preRequest}">
          {{ visibleRequest }} {{ (currentReq != preRequest)? t_fixed('notOrigin') : '' }}
        </span>
      </template>
      <b-dropdown-item
        v-for="a in get_options"
        :key="a"
        :data-testid="`DropdownDDProductRequest-Item-${a}`"
        @click="$emit('update:action', a);save(rowitem, a); visibleRequest=a"
      >
        {{ a }}
      </b-dropdown-item>
    </b-dropdown> -->
    <!-- <TooltipTTProductCell
      v-if="(visibleRequest==='mixed') && rowitem"
      type="actionRequest"
      :target="`DDProductRequest_actionRequest_hover_${rowitem.productId}`"
      :details="get_allRequests"
    /> -->
  </div>
</template>

<script lang="ts" setup>
import { useStrings } from '~/composables/mixins/useStrings';
import type { IObjectString2String } from '~/types/tgeneral';
import type { ITableRowItemProducts } from '~/types/ttable';

const t_fixed = useStrings().t_fixed
const config = storeConfigapp().config ?? { read_only: true }
const { changesProducts } = storeToRefs(storeChanges())

const selectionStore = storeSelections()
const {selectionClients} = storeToRefs(selectionStore)

const props = defineProps({
  rowitem: { type: Object as PropType<ITableRowItemProducts>, default: undefined },
  rowIsSelected: { type: Boolean, default: undefined },
  request: { type: String, default: '---' },
  requestoptions: { type: Array as PropType<Array<string>>, default: () => { return ['none', 'setup', 'uninstall', 'update', 'once', 'always', 'custom'] } },
  save: { type: Function, default: () => { return () => { return {} } } },
})
const selectedClients = ref(selectionClients.value)
const preRequest = ref(props.request)
const currentReq = ref(props.request)

const DEBUG = ref(props.rowitem?.productId === 'windomain')

const changesItem = computed(() => {
  // find item with productId
  // return (changes.value && changes.value[props.rowitem.productId]
  // TODO: find item with productId
})

watch(() => selectedClients, () => {
    currentReq.value = props.request
    preRequest.value = props.request
}, { deep: true })

function xorLike<T>(values: T[], mixedValue: string = "mixed"): T | string {
    if (values.length === 0) {
        return mixedValue; // Leere Liste, könnte auch undefined oder ein anderer Wert sein
    }

    // Überprüfen, ob alle Werte gleich sind
    const firstValue = values[0];
    const allEqual = values.every(value => value === firstValue);

    // Wenn alle gleich sind, gib den gemeinsamen Wert zurück, sonst "mixed"
    return allEqual ? firstValue : mixedValue;
  }


// Funktion zur Ermittlung des sichtbaren Wertes und zum Vergleich der Änderungen
function getVisibleValue(
    currentStatus: IObjectString2String,
    desiredStatus: IObjectString2String,
    selectedPCs: string[],
    mixedValue: string = "mixed"
): string {
    // Filtere nur die ausgewählten PCs und berücksichtige nur die PCs, die sowohl im aktuellen als auch im gewünschten Status vorhanden sind
    const currentValues = selectedPCs.map(pc => currentStatus[pc]).filter(Boolean);
    const desiredValues = selectedPCs.map(pc => desiredStatus[pc]).filter(Boolean);

    // Bestimme das Zwischenergebnis (aktueller Status)
    const currentZE = xorLike(currentValues, mixedValue);
    // Bestimme das neue Zwischenergebnis (gewünschter Status)
    const desiredZE = xorLike(desiredValues, mixedValue);

    // Vergleich: Hat sich das aggregierte Zwischenergebnis verändert?
    const zeHasChanged = currentZE !== desiredZE;

    // Überprüfe, ob sich einzelne Werte zwischen dem aktuellen und gewünschten Status geändert haben
    const individualChangeExists = selectedPCs.some(pc => desiredStatus[pc] !== undefined && currentStatus[pc] !== desiredStatus[pc]);

    // Wenn sich das Zwischenergebnis oder einzelne Werte geändert haben, markiere es mit einem *
    const result = zeHasChanged || individualChangeExists ? `${desiredZE}*` : `${desiredZE}`;

    return result;
}
// const productId = computed(() => {
//   return props.rowitem?.productId
// })
// const changedValuesForProductId = computed(() => {
//   if (DEBUG.value) {
//     console.log('changedValuesForProductId', changesProducts.value, productId.value)
//   }
//   // const vals = changes.value?.[productId.value]
//   // return changes.value && changes.value[productId.value]
//   return changesProducts.value?.filter((item: any) => item.productId === productId.value)
// })
// const valueFromChanges = computed(() => {
//   // for selectedClients
//     // if changedvalues equals to each other // return value
//     // if changedvalues not equals to each other // return mixed / red
//   if (selectedClients.value.length === 0) { return undefined }
//   if (changedValuesForProductId.value?.length === 0) { return undefined }

//   const clientId2valueChanges = changedValuesForProductId.value?.map((item: any) => {
//     return { [item.clientId]: item.actionRequest }
//   })

//   const allEqual = (arr: any) => arr.every((v: any) => v === arr[0])
//   const allChangedValuesEqual = allEqual(Object.values(clientId2valueChanges))
//   if (allChangedValuesEqual) {
//     const res = Object.values(clientId2valueChanges)[0]
//     console.log('changedValuesForProductId ze', res)
//     return res
//   }

//   // const value = ref<string|undefined>("XXX")
//   // for (const clientId in selectedClients.value) {
//   //   if (clientId2valueChanges[clientId] !== value) {
//   //     value.value = clientId2valueChanges[clientId]
//   //   }
//   //   if (clientId2valueChanges[clientId] !== undefined) {
//   //     return mixedValue
//   //   }
//   // }
//   return "idk"
//   // return changedValuesForProductId.value?.[0]?.actionRequest
// })
// if (DEBUG.value) {
//   console.log('changedValuesForProductId res', changedValuesForProductId.value)
//   console.log('changedValuesForProductId res2', valueFromChanges.value)
// }
const get_vis_req = () => {
  // currentReq.value = getVisibleValue(props.rowitem, item[1], selectedClients.value)
    currentReq.value = props.request
    // if (changes.value && )
    if (props.rowitem === undefined) {
      return currentReq.value
    }
    if (props.rowitem.selectedClients && props.rowitem.selectedClients.length !== selectedClients.value.length) {
      if (props.request !== 'none') {
        currentReq.value = 'mixed'
      }
    }
    return currentReq.value
  }
const visibleRequest = computed({
  get: get_vis_req,
  set: (val: string) => {
    currentReq.value = val
    if (props.rowitem && props.rowitem.actionRequest != val) {
      props.rowitem.actionRequestNew = val;
    }
  }
})
const get_options = computed(() => {
  const options = props.requestoptions
  if (currentReq.value === 'mixed' && !options.includes('mixed')) {
    options.push('mixed')
  }
  return options
})

if (DEBUG.value) {
  console.log("dummy. Current product: ", props.rowitem?.productId)
  console.log('dummy. Current request: ', props.request)
  console.log('dummy. Current request: ', props.rowitem)
  console.log("dummy. products clients:", props.rowitem?.selectedClients)
  console.log("dummy. Selected clients:", selectedClients.value)
  console.log('dummy. Visible Request: ', visibleRequest.value)
}

if (DEBUG.value) {
  const serverValsAll =  [
    { 'c1': '0', 'c2': '0', 'c3': '0' },
    { 'c1': '0', 'c2': '1', 'c3': '0' },
    { 'c1': '1', 'c2': '0', 'c3': '1' },
    { 'c1': '1', 'c2': '1', 'c3': '1' },
  ]
  const changesValsAll =  [
    { 'c1': '0', 'c2': '0' },
    { 'c1': '0', 'c2': '1' },
    { 'c1': '1', 'c2': '0' },
    { 'c1': '1', 'c2': '1' },
  ]
  // const allVals = serverValsAll.concat(changesValsAll)
  const allVals = serverValsAll.flatMap(item1 => changesValsAll.map(item2 => [item1, item2]));
  // console.log("dummy", allVals)
  const clients = ['c1', 'c2', 'c3'] // selectionClients.value
  // console.log("dummy selectionClients.value", selectionClients.value)

  for (const item of allVals) {
    const vals = [Object.values(item[0]), Object.values(item[1])]
    console.log("dummy ", item[0], item[1], xorLike(vals[0]), xorLike(vals[1]), getVisibleValue(item[0], item[1], clients))
    // break
  }
}

</script>

<style>
.widthmax {
  width: 100%;
}
.DDProdRequest .dropdown-menu .dropdown-item {
  font-weight: normal !important;
}
</style>
