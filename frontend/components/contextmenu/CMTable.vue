<template>
  <!-- <PContextMenu ref="cmmenu" :model="items" class="min-w-60 p-0" unstyled> -->
  <ContextMenu ref="cmmenu" :model="items" class="p-contextmenu">
    <template #item="{ item, hasSubmenu }">
      <div class="inline">
        <IconIIcon v-if="item.icon" :icon="item.icon" class="inline ml-2 mr-4" />
        <span class="inline">{{ item.label }}</span>
        <!-- <PButton @click="() => call_opsievent('hi')">Hallo</PButton> -->
        <span v-if="hasSubmenu" class="inline float-right">
          <IconIIcon :icon="icons.arrowRight" />
        </span>
      </div>
    </template>
  </ContextMenu>
</template>

<script setup lang="ts">
import { useIcons } from '../../composables/mixins/useIcons';
import ContextMenu from 'primevue/contextmenu';
import { useNavigate } from '~/composables/mixins/useNavigateTo';
// const curRowContext = ref()
const icons = useIcons()
const $t = useI18n().t
const cmmenu = ref()
const props = defineProps({
  item: { type: String, default: '' },
  key: { type: String, default: 'ident' },
  type: { type: String, default: 'servers' }
})
watch(()=>props.item, ()=>{
  items.value[0].label = $t('table.contextmenu.header-specific', {id: props.item[props.key]})
}, { deep: true })

const items = ref([
    { label: $t('table.contextmenu.header-specific', {id: 'XXX'}) , icon: icons.edit, disabled: true /* row ident */ },
    { label: $t('button.item-actions'), icon: icons.menu, items: [
      { label: $t('button.event.ondemand'), command: ()=>call_opsievent('ondemand')},
      { label: $t('button.event.showpopup'), command: ()=>call_opsievent('showpopup')},
      { label: $t('button.event.reboot'), command: ()=>call_opsievent('reboot')},
      { label: $t('label.clientagent'), command: ()=>call_opsievent('deployclientagent')},
      { label: $t('label.rename'), command: ()=>call_opsievent('rename')},
      { label: $t('label.remove'), command: ()=>call_opsievent('remove')},

    ] },
    { label: $t('title.config'), icon: icons.settings, command: () => call_navigate('config')},
    { label: $t('title.log'), icon: icons.log, command: () => call_navigate('logs')},


    {
        separator: true
    },

    { label: $t('button.sort.tablecolumns'), icon: icons.sort },
    { label: $t('table.showCol'), icon: icons.columns },
    { label: $t('button.reload'), icon: icons.refresh
      // ,command:(e: any, e2: any) => alert('hi: ' + JSON.stringify(e) + ' ' +JSON.stringify(curRowContext.value))
    },
])

defineExpose({ show })
function show(e: any) {
  // curRowContext.value = e
  items.value[0].label = $t('table.contextmenu.header-specific', {id: props.item[props.key]})
  cmmenu.value.show(e)
}

const navigation = useNavigate()

function call_opsievent(event: string) {
  console.log('call_opsievent', event)
  alert('call_opsievent: ' + event + " on client " + props.item[props.key])
}
function call_navigate(pagetype: string) {
  navigation.toType(props.type, props.item[props.key], pagetype)
  switch (pagetype) {
    case 'config':
      break;

    default:
      break;
  }
  // const {data, error} = await useApiGETBody<Array<T_ClientAttr>>(`/opsidata/hosts?hosts=${id}`)
  // const {data, error} = await useClient().getClientIdList(storeSel.selectionDepots)
  // if (error) {
  //   console.log(error)
  //   useNotification().error(error)
  //   return
  // }
  // fetchedData.value = data.value
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