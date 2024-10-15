<template>
  <div>
    <!-- size="small"  -->
    <el-select
      v-model="visibleRequest">
      <el-option
        v-for="a in get_options"
        :key="a"
        :label="a"
        :value="a"
        :data-testid="`DropdownDDProductRequest-Item-${a}`"
        @click="save(rowitem, a); visibleRequest=a"
        />
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
// import { useStrings } from '~/composables/mixins/useStrings';
import type { ITableRowItemProducts } from '~/types/ttable';

// import { Component, namespace, Prop, Watch } from 'nuxt-property-decorator'
// import { BDropdown } from 'bootstrap-vue'
// import { ITableRowItemProducts } from '../../.utils/types/ttable'
// import { IObjectString2Boolean } from '../../.utils/types/tgeneral'
// import { mapValues2Objects } from '../../.utils/utils/smappings'
// import { Strings } from '../../mixins/strings'
// const t_fixed = useStrings().t_fixed

const selectionStore = storeSelections()
const {selectionClients} = storeToRefs(selectionStore)
// const configStore = storeConfigapp()
// const {config} = storeToRefs(configStore)
// const selections = namespace('selections')
// const config = namespace('config-app')


// @Component({ mixins: [Strings] })
// export default class DDProductRequest extends BDropdown {
//   t_fixed: any
const props = defineProps({
  rowitem: { type: Object as PropType<ITableRowItemProducts>, default: undefined },
  rowIsSelected: { type: Boolean, default: undefined },
  request: { type: String, default: '---' },
  requestoptions: { type: Array as PropType<Array<string>>, default: () => { return ['none', 'setup', 'uninstall', 'update', 'once', 'always', 'custom'] } },
  save: { type: Function, default: () => { return () => { return {} } } },
  // selectedClients: { type: Array as PropType<Array<string>>, default: () => { return selectionClients.value } }
})
const selectedClients = ref(selectionClients.value)
const preRequest = ref(props.request)
const currentReq = ref(props.request)

// function updated () {
//   preRequest.value = visibleRequest.value
// }
watch(() => selectedClients, () => {
    currentReq.value = props.request
    preRequest.value = props.request
  }, { deep: true })

  // @Watch('selectionClients', { deep: true }) selectionClientsChanged () {
  //   this.currentReq = this.request
  //   this.preRequest = this.request
  //   return this.currentReq
  // }
const get_vis_req = () => {
    currentReq.value = props.request
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
  }
})
const get_options = computed(() => {
  const options = props.requestoptions
  if (currentReq.value === 'mixed' && !options.includes('mixed')) {
    options.push('mixed')
  }
  return options
})

// const get_allRequests = computed(() => {
//   if (props.rowitem === undefined) {
//     return {}
//   }
//   if (props.rowitem.actionRequestDetails || selectedClients.value.length > 1) {
//     return mapValues2Objects(props.rowitem.actionRequestDetails ?? [props.rowitem.actionRequest], props.rowitem.selectedClients, selectedClients.value, 'none')
//   }
//   return {}
// })
</script>

<style>
.widthmax {
  width: 100%;
}
.DDProdRequest .dropdown-menu .dropdown-item {
  font-weight: normal !important;
}
</style>
