<template>
  <!-- <el-text>{{ tableId }}</el-text> -->
  <el-select-v2
    v-model="columnVisibilityList"
    :options="headerWrapper"
    :multiple="multiCondition"
    :max-collapse-tags="0"
    collapse-tags
    class=""
    popper-class="w-250"
    @change="handleItem"
    >
    <!-- @remove-tag="handleItem" -->
    <!-- collapse-tags-tooltip -->
  <template #prefix>
    <el-text>
      <IconIIcon data-testid="ITableColumn" :icon="icons.columns" class="w-4 h-4"/>
    </el-text>
  </template>

  <template #default="{ item }">
      <span class="w-fit">{{ item.label }}</span>
      <!-- <span style="color: var(--el-text-color-secondary); font-size: 13px">
        {{ item.value }}
      </span> -->
    </template>
  <!-- <template #default>option</template> -->
  </el-select-v2>
  <!-- <el-text><pre>{{ tableStore.columns[props.tableId] }}</pre></el-text> -->
  <!-- <el-text><pre>{{ headerWrapper.map(v=>v.value) }}</pre></el-text> -->
  <!-- <el-text><pre>{{ _headers }}</pre></el-text> -->
  <!-- <div
    class="DropdownDDTableColumnVisibilityWrapper"
    :class="{ 'incontextmenu': props.incontextmenu }"
    @mouseover="props.incontextmenu ? useHoverDropdown().onOver($refs.columndropdown) : null"
    @mouseleave="props.incontextmenu ? useHoverDropdown().onLeave($refs.columndropdown) : null"
    @focusin="props.incontextmenu ? useHoverDropdown().onOver($refs.columndropdown) : null"
    @focusout="props.incontextmenu ? useHoverDropdown().onLeave($refs.columndropdown) : null"
  >
    <b-dropdown
      ref="columndropdown"
      v-bind="$props"
      size="sm"
      data-testid="DropdownDDTableColumnVisibility"
      :variant="incontextmenu? 'transparent border-0' : 'outline-primary border-0'"
      :no-caret="!incontextmenu"
      :title="incontextmenu ? '' : $t('table.showCol')"
      :class="{ 'rightmenu': mq.$mq == 'mobile', 'dropdown-item contextmenu': incontextmenu }"
      :dropright="incontextmenu"
      @show="init"
    >
      <template #button-content>
        <IconIIcon data-testid="ITableColumn" :icon="icons.columns" />
        <span v-if="incontextmenu">{{ $t('button.showCol') }}</span>
      </template>
      <template v-if="multiCondition">
        <ul>
          <li
            v-for="header in headerValues.filter((h:ITableHeaderCell)=>h.fixed!==true && h.key!='_empty_' && h._majorKey==undefined)"
            :key="header.key"
            class="dropdown-item"
            :class="{'disabled':!header.disabled&&header.disabled!=undefined, 'incontextmenu': incontextmenu}"
            :tabindex="incontextmenu ? undefined : 0"
            @keydown.prevent="handleItem(header.key)"
            @click.prevent="handleItem(header.key)"
          >
            <a class="columnWrapper">
              <b-form-checkbox
                :checked="columnVisibilityList.includes(header.key)"
                :class="{'selectedColumn':columnVisibilityStates[header.key]}"
              >  {{ header.title }} </b-form-checkbox>
            </a>
          </li>
        </ul>
      </template>
      <template v-else>
        <b-dropdown-item
          v-for="header in headerValues.filter((h:ITableHeaderCell)=>h._fixed!==true && h._majorKey==undefined)"
          :key="header.key"
          inline
          :class="{
            'selectedColumn':columnVisibilityStates[header.key] || columnVisibilityList.includes(header.key),
            disabled: header.disabled!=undefined&&header.disabled, 'incontextmenu': incontextmenu
          }"
          @click.prevent="setColumnVisibilityModel(header.key)"
        >
          {{ header.label }}
        </b-dropdown-item>
      </template>
    </b-dropdown>
  </div> -->
  <br />
  <!-- <el-text>{{ _headers.description }}</el-text> -->
  <!-- <br /> -->
</template>

<script setup lang="ts">
import { useIcons } from '~/composables/mixins/useIcons'
import { useUtilsData } from '~/composables/mixins/useUtilsData'
import { useCookies } from '~/composables/mixins/useCookies'
import type { ITableHeaderRow, ITableHeaderCell } from '~/types/ttableV3'
import type { PropType } from 'vue';
const icons = useIcons()
const cookies = useCookies()
const mq = useMQ()

const tableStore = storeTablesettings()
const settings = storeSettings()

const props = defineProps({
  tableId: { type: String, default: 'table'},
  sortBy: { type: String, default: ''},
  sortDesc: { type: Boolean, default: false},
  incontextmenu: { type: Boolean, default: false},
  multi: { type: Boolean as PropType<Boolean|undefined>, default: undefined},
  headers: { type: Object as PropType<ITableHeaderRow>, default: () => {}},
})


const _headers = reactive({ ...props.headers })
const $emit = defineEmits(['update:headers'])
const viewId = ((props.tableId === 'Localboot') || (props.tableId === 'Netboot')) ? 'products' : props.tableId

const headerValues = computed<Array<ITableHeaderCell>>( () => {
  return Object.values(_headers)
})
const multiCondition = computed(() => {
  return true
  // if (props.multi===undefined) return true
  // if (props.multi)
  //   return mq.$mq.value === 'mobile' || settings.twoColumnLayoutCollapsed[viewId]
  // return true
})

const columnVisibilityList = reactive<Array<string>>([])
// const columnVisibilityStates = reactive<IObjectString2Boolean>({})
const headerWrapper = computed<Array<any>>(() => {
  return headerValues.value.filter((h:ITableHeaderCell)=>
    // h.fixed!==true &&
    h.key!='_empty_' &&
    (h._majorKey===undefined ||
    h._isMajor!==undefined)
  // ).map((v,i) => ({ value: v.key, label: v.title, disabled: false}))
  ).map((v,i) => ({ value: v.key, label: v.title, disabled: v.fixed != undefined}))
})

// const columnVisibilityListWrapper = ref<Array<string>>([])
// const columnVisibilityListWrapper = computed<Ref<Array<string>>>( () => {
//   return ref(columnVisibilityList)
// })

onMounted(() => { init() })

function init () {
  // if (cookies.existsCookie('column_' + viewId)) {
  //   // columnVisibilityList = cookies.getParsedCookie('column_' + viewId)
  //   columnVisibilityList.length = 0
  //   columnVisibilityList.push(...cookies.getParsedCookie('column_' + viewId))
  // } else
  {
    // Object.values(_headers).filter(k => !k._isMajor).forEach((h) => {
    //   if (h._majorKey) {
    //     columnVisibilityStates[_headers[h._majorKey].key] = !h.hidden || true
    //   } else {
    //     columnVisibilityStates[h.key] = !h.hidden || true
    //   }
    // })

    columnVisibilityList.length = 0
    const columnHidden = {}
    Object.values(_headers).forEach((item: any) => columnHidden[item.key] = item.hidden)
    console.log('description columnHidden', columnHidden)
    const ids = useUtilsData().getVisibleColumnIds(Object.values(_headers))
    console.log('description headers', ids)
    columnVisibilityList.push(...ids)
    // columnVisibilityList.push(...headerWrapper.value.map((_v:any) => _v.value))
    // columnVisibilityList.push(...Object.values(_headers.value)
    //   // .filter(_v=>(
    //   //   _v.fixed === false || _v.fixed === undefined
    //   // ))
    //   .map((v:any) => v.key))
    // columnVisibilityList.push(...Object.keys(columnVisibilityStates).filter(k => columnVisibilityStates[k]))
    // columnVisibilityList = Object.keys(columnVisibilityStates).filter(k => columnVisibilityStates[k])
  }
  // columnVisibilityListWrapper.value = columnVisibilityList
  // tableStore.setColumns(props.tableId, columnVisibilityList)
}

watch(_headers, () => {
  console.log("hallo ? description header changed ")
  $emit('update:headers', _headers)
}, { deep: true })
// watch(() => props.sortBy, () => {
//   if (!_headers[props.sortBy] || !_headers[props.sortBy].hidden) { return }
//   const majorKey = _headers[props.sortBy]._majorKey
//   let sortBy = props.sortBy
//   if (majorKey) { sortBy = majorKey }

//   // if (!multiCondition) {
//   //   setColumnVisibilityModel(sortBy)
//   // } else {
//     handleItem(sortBy)
//   // }
// })

// watch(()=> mq.$mq, () => {
//   if (!multiCondition && mq.$mq.value === 'mobile') {
//     const firstVisible: string|undefined = Object.keys(columnVisibilityStates).find(k => k !== '_empty_' && columnVisibilityStates[k])
//     setColumnVisibilityModel(firstVisible)
//   }
// })

function handleItem (key: Array<string>) {
  console.log("visibility handleItem oldSelection ", columnVisibilityList)
  console.log("visibility handleItem newSelection ", key)

  let symDifference = columnVisibilityList.filter(x => !key.includes(x))
                        .concat(key.filter(x => !columnVisibilityList.includes(x)));
  let _key = ''
  if (symDifference.length == 1) {
    _key = symDifference[0]
  } else console.error('this shouldnt happen')
  console.log("visibility handleItem key is: ", _key)
  console.log("visibility handleItem was visible", columnVisibilityList.includes(_key))
  const hiddenNow = !key.includes(_key)
  columnVisibilityList.length = 0
  columnVisibilityList.push(...key) // for e-select-v2 its a list
  console.log("visibility handleItem  is visible", columnVisibilityList.includes(_key))

  // if (columnVisibilityList.includes(key)) {
  //   // columnVisibilityList = columnVisibilityList.filter(s => s !== key)

  //   const index = columnVisibilityList.indexOf(key); // checked it before
  //   columnVisibilityList.splice(index, 1); // 2nd parameter means remove one item only
  //   hiddenNow = true
  // } else {
  //   hiddenNow = false
  //   columnVisibilityList.push(key)
  // }
  // console.log("description is  visible", columnVisibilityList.includes(key))

  // cookies.setCookie('column_' + viewId, columnVisibilityList)
  console.log('visibility handleItem hidden was ', _headers[_key].hidden)

  _headers[_key].hidden = hiddenNow
  console.log('visibility handleItem hidden is  ', _headers[_key].hidden)
  // columnVisibilityListWrapper.value = columnVisibilityList

  console.log('visibility handleItem updateStore ', columnVisibilityList)
  tableStore.setColumns(props.tableId, columnVisibilityList)

  $emit('update:headers', _headers)
  // init()
}

// function setColumnVisibilityModel (tableKey: string|undefined) {
//   // set all columns to false"
//   Object.keys(columnVisibilityStates).forEach((k) => {
//     columnVisibilityStates[k] = false
//     _headers[k].hidden = true
//   })

//   // set one columns to true (mobile-view)
//   if (tableKey !== undefined) {
//     columnVisibilityStates[tableKey] = true
//     columnVisibilityList.length = 0
//     columnVisibilityList.push(...Object.keys(columnVisibilityStates).filter(k => columnVisibilityStates[k]))
//     // columnVisibilityList = Object.keys(columnVisibilityStates).filter(k => columnVisibilityStates[k])
//   } else {
//     // set selected columns to true (desktop-view)
//     columnVisibilityList.forEach((k: string) => {
//       columnVisibilityStates[k] = true
//     })
//   }
//   // change visibilty of children if any major column is selected
//   Object.keys(columnVisibilityStates).forEach((k) => {
//     if (_headers[k] && !_headers[k]._isMajor) {
//       _headers[k].hidden = !columnVisibilityStates[k]
//     } else {
//       Object.values(_headers).filter(h => h._majorKey === k).map(h => h.key).forEach((ck) => {
//         _headers[ck].hidden = !columnVisibilityStates[k]
//       })
//     }
//   })
//   // triggerupdate
//   // const _headers = {..._headers}
//   console.warn("HALLO description")
//   console.log("description visible", _headers.description.hidden)
//   $emit('update:headers', _headers)
// }
// }
</script>

<style scoped>
.el-select {
  width: max-content;
}
:deep(.el-vl__window.el-select-dropdown__list) {
  width: 150px !important;
}
:deep(.el-select-v2__wrapper) {
  padding: 5px !important;
}

:deep(.el-select__selection),
:deep(.el-select__placeholder),
:deep(.el-select__suffix),
:deep(.el-select-v2__selection),
:deep(.el-select-v2__placeholder),
:deep(.el-select-v2__suffix) {
  display: none !important;
}
/* .DropdownDDTableColumnVisibilityWrapper .selectedColumn .dropdown-item {
  color: var(--light) !important;
  background-color: var(--primary-dark) !important;
}
.DropdownDDTableColumnVisibilityWrapper .rightmenu .dropdown-menu {
  right: 0 !important;
}
.DropdownDDTableColumnVisibilityWrapper .columnWrapper > div {
  display: inline-block !important;
}
.DropdownDDTableColumnVisibilityWrapper .dropdown-menu > ul {
  padding: 0;
}
.DropdownDDTableColumnVisibilityWrapper .dropdown-menu.show{
  position: absolute !important;
  left: auto;
  right: 0;
} */
</style>
