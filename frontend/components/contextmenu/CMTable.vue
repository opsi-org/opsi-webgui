<template>
  <PContextMenu v-if="items" ref="cmmenu" :model="items" class="p-contextmenu">
    <template #item="{ item, hasSubmenu }">
      <div class="inline" >
        <IconIIcon v-if="item.icon" :icon="item.icon" class="inline ml-2 mr-4" />
        <span class="inline">{{ item.label }}</span>
        <span v-if="hasSubmenu" class="inline float-right">
          <IconIIcon :icon="icons.arrowRight" />
        </span>
      </div>
    </template>
  </PContextMenu>
  <ModalMClientEvents v-if="showModal" v-model="showModal" :event="selectedAction" :id="props.item[keyWrapper]"/>
</template>

<script setup lang="ts">
import { useIcons } from '../../composables/mixins/useIcons';
import { useNavigate } from '~/composables/mixins/useNavigateTo';
import type { TRowData } from '~/types/Datatypes'

const navigation = useNavigate()
const icons = useIcons()
const $t = useI18n().t

defineExpose({ show, hide })
const emit = defineEmits(['refetch'])
// const itemModel = defineModel<TRowData>()
const props = defineProps({
  item: { type: Object as PropType<TRowData>, default: {} },
  rowId: { type: String, default: 'ident' },
  type: { type: String, default: 'servers' },
  // tableData: { type: Object as PropType<ITableData>, required: true }, // TODO: show/hide coluns, sort; BUT as defineModel
  // columns: { type: Array as PropType<columns>, required: true },
})
const cmmenu = ref()
const showModal = ref(false)
const selectedAction = ref('')
const items = ref([
  { id: '_header', label: $t('table.contextmenu.header-specific', {id: 'XXX'}), disabled: true /* row ident */ },

  { id: 'action_ondemand_all', label: $t('button.event.ondemand'), icon: icons.ondemand, command: ()=>call_opsievent('ondemand-all'), visible: props.type !== 'clients'},
  { id: '_actions', label: $t('button.item-actions'), icon: icons.menu, visible: props.type === 'clients', items: [
    { id: 'action_ondemand', label: $t('button.event.ondemand'), command: ()=>call_opsievent('ondemand')},
    { id: 'action_showpopup', label: $t('button.event.showpopup'), command: ()=>call_opsievent('showpopup')},
    { id: 'action_reboot', label: $t('button.event.reboot'), command: ()=>call_opsievent('reboot')},
    { id: 'action_clientagent', label: $t('label.clientagent'), command: ()=>call_opsievent('deployclientagent')},
    { id: 'action_rename', label: $t('label.rename'), command: ()=>call_opsievent('rename')},
    { id: 'action_delete', label: $t('label.delete'), command: ()=>call_opsievent('delete')},
  ] },
  { id: 'to_config', label: $t('title.config'), icon: icons.settings, command: () => call_navigate('config')},
  { id: 'to_log', label: $t('title.log'), icon: icons.log, command: () => call_navigate('logs')},

  {
      separator: true
  },

  { id: 'table_sort', label: $t('button.sort.tablecolumns'), icon: icons.sort, items:[
  ]},
  { id: 'table_showcol', label: $t('table.showCol'), icon: icons.columns, items:[
  ]},

  { id: 'page_reload', label: $t('button.reload'), icon: icons.refresh, command: () => emit('refetch')},
])
const keyWrapper = ref(props.rowId)

watch(() => props.item, (newVal, oldVal) => {
  items.value[0].label = $t('table.contextmenu.header-specific', {id: props.item[keyWrapper.value]})
})
function show(e: Event) {
  if (props.item === undefined || props.item[keyWrapper.value] === '')
    throw new Error("itemModel is undefined [1]")
  if (e === undefined)
    throw new Error("event is undefined")
  cmmenu.value.show(e)
  // cmmenu.value.show()
}
function hide() {
  // props.item = undefined
  cmmenu.value.hide()
}

function call_opsievent(event: string) {
  selectedAction.value = event
  showModal.value = true
}
function call_navigate(pagetype: string) {
  if (props.item === undefined)
    throw new Error("itemModel is undefined [2]")

  if (props.type === 'products') {
    const currProdType = 'LocalbootProduct'
    const idChildOfClients = false
    navigation.toConfiguration(props.type, props.item[keyWrapper.value], idChildOfClients, currProdType)
  } else {
    navigation.toType(props.type, props.item[keyWrapper.value], pagetype)
  }

}

</script>


<style>
html .p-contextmenu {
  --bg: var(--el-bg-color);
  --bg-hover: var(--opsi-general-light);
  background: var(--bg) !important;
  background-color: var(--bg);
  color: var(--el-color-text);
}
html.dark .p-contextmenu {
  --bg: #2b2b2b;
  --bg-hover: #3c3c3c;
  background-color: var(--bg);
}
.p-contextmenu {

  border-radius: 0.25rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);

  ul {
    /* cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-200 transition-all ease-linear dark:hover:bg-gray-800/50 p-4 w-full h-full text-gray-800 dark:text-gray-200 relative; */
    /* background-color: var(--el-color-white); */
    /* color: var(--el-color-text); */
    /* transition: all 0.2s ease-in-out;
    position: relative;
    width: 100%;
    height: 100%; */
    /* menu flex flex-col rounded-md shadow-xl overflow-hidden */
    padding: 0px;
    margin: 0px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  ul ul {
    /* background-color: blue; */
    position: absolute;
    background: var(--bg);
    min-width: 200px;
    /* left: 100; */

    border-radius: 0.25rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  }
  li {
    cursor: pointer;
    padding: 0.5rem;
    /* border: 1px solid blue; */

    &:hover {
      background-color: var(--bg-hover);
      color: var(--el-color-text-hover);
    }
  }
  li[data-pc-section="separator"] {
    border: none;
    border-bottom: 1px solid white;
  }
}
</style>