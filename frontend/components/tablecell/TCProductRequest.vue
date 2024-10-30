<template>
  <div>
    <el-select
      v-model="visibleRequest"
      :disabled="config.read_only"
      class="min-w-[82px] w-[82px]"
      :class="{
        '!text-red-600': visibleRequest?.includes('*'),
      }"
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
        <!-- <el-text :type="visibleRequest?.includes('*') || visibleRequest != preRequest ? 'danger': ''"> -->
        <el-text :type="visibleRequest?.includes('*') ? 'danger': ''">
        <!-- <el-text :type="visibleRequest != request ? 'danger': ''"> -->
          {{ label }} ({{ request }})
          <!-- {{ label }} {{ (currentReq != preRequest)? t_fixed('notOrigin'): '' }} ({{ request }}) -->
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

const DEBUG = ref(props.rowitem?.productId.startsWith('win'))


watch(() => props.rowitem, () => {
  if (DEBUG.value)
  console.warn('dummy. change. rowitem', props.rowitem?.productId, props.rowitem?.actionRequest, props.rowitem )
}, { deep: true })
watch(() => selectedClients, () => {
  if (DEBUG.value)
  console.warn('dummy. change. selectedClients', selectedClients.value)
    currentReq.value = props.request
    preRequest.value = props.request
}, { deep: true })


function xorLike<T>(values: T[], mixedValue: string = "mixed"): T | string| undefined {
    if (values.length === 0) {
        return undefined; // Leere Liste, könnte auch undefined oder ein anderer Wert sein
    }

    // Überprüfen, ob alle Werte gleich sind
    const firstValue = values[0];
    const allEqual = values.every(value => value === firstValue);
    // const allClients = selectedClients.value.length === values.length
    
    // Wenn alle gleich sind, gib den gemeinsamen Wert zurück, sonst "mixed"
    return allEqual ? firstValue : mixedValue;
}
// Funktion zur Ermittlung des sichtbaren actionRequest-Werts
// Abhängig von den ausgewählten Clients und den lokalen nicht gespeicherten Änderungen
// Mögliche Werte <actionRequest (setup, uninstall,...)>, "mixed" oder "none"
// Kann einen *-Stern enthalten, wenn sich der Wert geändert hat im vergleich zum backend Wert
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
    let currentZE = xorLike(currentValues, mixedValue);
    if (currentZE === undefined) {
      currentZE = 'none'
    }
    if (DEBUG.value) console.warn('dummy.        currentValues', currentValues, "->", currentZE)
    // Bestimme das neue Zwischenergebnis (gewünschter Status)
    const desiredZE = xorLike(desiredValues, mixedValue);
    if (desiredZE === undefined) {
      return currentZE
    }
    if (DEBUG.value) console.warn('dummy.        desiredValues', desiredValues, "->", desiredZE)
    // Vergleich: Hat sich das aggregierte Zwischenergebnis verändert?
    const zeHasChanged = currentZE !== desiredZE;

    // Überprüfe, ob sich einzelne Werte zwischen dem aktuellen und gewünschten Status geändert haben
    const individualChangeExists: boolean = selectedPCs.some(pc => desiredStatus[pc] !== undefined && currentStatus[pc] !== desiredStatus[pc]);
    const justNone: boolean = desiredZE === 'none' && currentZE === 'none'

    // Wenn sich das Zwischenergebnis oder einzelne Werte geändert haben, markiere es mit einem *
    const result = zeHasChanged || (individualChangeExists && !justNone) ? `${desiredZE}*` : `${desiredZE}`;
    if (DEBUG.value) console.warn('dummy.        zeHasChanged', zeHasChanged, 'individualChangeExists', individualChangeExists, '->', result)
    return result;
}

const visibleRequest = computed({
  // get: get_vis_req,
  get: () => {
    if (props.rowitem === undefined) {
      return undefined
    }
    if (DEBUG.value) console.warn('dummy. --------')
    if (DEBUG.value) console.warn('dummy. props.rowitem', props.rowitem.productId, props.rowitem.actionRequest, props.rowitem )
    // format origin backend values to { client: actionRequest}
    // TODO check for multiselected clients
    const originValues: IObjectString2String = {}
    selectedClients.value.forEach((item: any) => {
      const iitem = props.rowitem?.selectedClients?.indexOf(item)
      if (iitem != undefined  && iitem >= 0) {
        // index of item in props.rowitem?.selectedClients
        originValues[item] = props.rowitem?.actionRequestDetails?.[iitem] || props.rowitem?.actionRequest || 'none'
        if (DEBUG.value) console.warn('dummy.      iclient', iitem, 'aRDetails', props.rowitem?.actionRequestDetails?.[iitem], 'aR', props.rowitem?.actionRequest)
      } else {
        originValues[item] = 'none'
        // originValues[item] = props.rowitem?.actionRequest || 'none'
        if (DEBUG.value) console.warn('dummy.      iclient', iitem, props.rowitem?.actionRequest)
      }
      // originValues[item] = props.request != 'mixed' ? props.request : props.rowitem?.actionRequest || 'none'
    })
    // if (props.rowitem.selectedClients) {
    //   props.rowitem?.selectedClients.forEach((item: any) => {
    //     originValues[item] = props.request != 'mixed' ? props.request : props.rowitem?.actionRequest || 'none'
    //   })
    // }

    // format changes to { client: actionRequest}
    const changeValues: IObjectString2String = {}
    changesProducts.value?.forEach((item: any) => {
      if (item.productId === props.rowitem?.productId) {
        changeValues[item.clientId] = item.actionRequest
      }
    })

    const res = getVisibleValue(originValues, changeValues, selectedClients.value)
    if (DEBUG.value) console.warn('dummy. originValues', originValues)
    if (DEBUG.value) console.warn('dummy. changeValues', changeValues)
    if (DEBUG.value) console.warn('dummy. res', res)
    return res
  },
  set: (val: string) => {
    currentReq.value = val
    if (props.rowitem && props.rowitem.actionRequest != val) {
      // props.rowitem.actionRequestNew = val;
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


</script>

<style>
.widthmax {
  width: 100%;
}
.DDProdRequest .dropdown-menu .dropdown-item {
  font-weight: normal !important;
}
</style>
