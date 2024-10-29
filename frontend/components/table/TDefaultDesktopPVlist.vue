<template>
  <div>
    <div class="max-w-full" >
    <!-- :class="{small: props.small !== false}" -->
      <IconILoading v-if="dataModel.length <= 0" />
      <!-- HEADER -->
      <!-- SortBy: {{ tableData.value.sortBy }}, SortDesc: {{ tableData.value.sortDesc }} -->
      <div class="flex justify-content-between">
        <div>
          <slot name="header-title" />
          <!-- <h4>{{ props.id }}</h4> -->
        </div>
        <div class="flex">
          <slot name="header-pre-visibility"/>
          <SelectSColumnVisibility :table-id="props.id" v-model:possible-columns="columnsModel" />
          <slot name="header-pre-filter"/>
          <InputIFilter
            :data="tableData"
            :filterable-columns="Object.values(wrappedColumns)"
            @update="($event: any) => $emit('update-input-filter', $event)"
          />

          <slot name="header-post-filter"/>
        </div>
      </div>
        <!-- <PContextMenu ref="cmmenu" :model="cmmenuItems" @hide="currentSelectedRow.value = null" /> -->
        <PVirtualScroller
          :items="dataModel"
          :item-size="50"
          show-loader
          class=" min-h-192"
        >
          <template #content="{  }">
            <table class="table-auto w-full min-h-96">
              <thead
                class="sticky top-0 z-[999] !h-[50px] !max-h-[50px] bg-light"
                :class="{
                  'bg-light': settings.colormode === undefined || settings.colormode === 'light',
                  'bg-dark': settings.colormode === 'dark',
                  // 'bg-dark': settings.colormode === 'dark'
                }"
              >
                <tr class="h-[50px]">
                  <template v-for="col in (visibleColumns as any)" :key="col.key">
                    <template v-if="col.key.startsWith('_')" >
                      <th
                        :key="col.key + (colChild.key as string)"
                        v-for="colChild in Object.values(columnsModel).filter(e => e._majorKey === col.key)"
                        :class="{
                          'max-h-[50px]': true,
                          'cursor-pointer': colChild.sortable,
                        }"
                        @click="(colChild.sortable) ? onSort({sortField: colChild.key, sortDescOld: tableData.sortDesc}) : undefined"
                        >
                        <!-- @contextmenu="rowEventHandlers.onContextmenu()" -->
                        <el-badge v-if="colChild.headerCellRenderer" :type="colChild.headerCounterBadgeColor" :class="colChild.headerCounterBadgeClass" :value="colChild.headerCounterBadge" :hidden="colChild.headerCounterBadge === undefined">
                          <HeaderCellRenderer :col-data="colChild" :key="colChild.title"/>
                        </el-badge>
                        <el-badge v-else-if="colChild.icon || colChild.icons" :type="colChild.headerCounterBadgeColor" :class="colChild.headerCounterBadgeClass" :value="colChild.headerCounterBadge" :hidden="colChild.headerCounterBadge === undefined">
                          <el-tooltip effect="dark" :content="colChild.tooltip">
                            <IconIIcon v-if="colChild.icon" :icon="colChild.icon" :style="'color: var(' + colChild.iconColor + ')'" />
                            <div v-else-if="colChild.icons">
                              <IconIIcon v-for="icon in colChild.icons" :key="icon" :icon="icon" :style="'color: var(' + colChild.iconColor + ')'" />
                            </div>
                          </el-tooltip>
                        </el-badge>
                        <el-text v-else>{{ colChild.title || colChild.tooltip }}</el-text>
                        <IconIIcon v-if="colChild.sortable" :icon="tableData.sortBy == colChild.key ? ( (tableData.sortDesc) ?icons.sortDesc: icons.sort) : icons.sort_not" class="inline ml-2"/>
                      </th>
                    </template>
                    <th
                      v-else
                      :class="{
                          'max-h-[50px]': true,
                          'cursor-pointer': col.sortable,
                        }"
                      @click="(col.sortable) ? onSort({sortField: col.key, sortDescOld: tableData.sortDesc}) : undefined"
                    >
                      <el-badge v-if="col.headerCellRenderer" :type="col.headerCounterBadgeColor" :class="col.headerCounterBadgeClass" :value="col.headerCounterBadge" :hidden="col.headerCounterBadge === undefined">
                        <HeaderCellRenderer :col-data="col" :key="col.title"/>
                      </el-badge>
                      <el-text v-else>{{ col.title }}</el-text>
                      <IconIIcon v-if="col.sortable" :icon="tableData.sortBy == col.key ? ( (tableData.sortDesc) ?icons.sortDesc: icons.sort) : icons.sort_not" class="inline ml-2"/>
                    </th>

                  </template>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in dataModel"
                  :key="item[props.rowId]"
                  :class="{
                    'h-[50px]': true,
                    'border-b border-slate-600/50': true
                  }"
                  @click.prevent="rowEventHandlers.onClick(item)"
                  @dblclick="rowEventHandlers.onDblclick(item)"
                  @contextmenu="rowEventHandlers.onContextmenu({rowData: item, event: $event})"
                >
                  <template v-for="col in (visibleColumns as any)" :key="col.key">

                    <td v-if="!renderCells"><el-text>{{ item[col.key] }}</el-text></td>
                    <template v-else-if="col.key.startsWith('_')">
                      <td
                        :key="col.key + (colChild.key as string)"
                        v-for="colChild in Object.values(columnsModel).filter(e => e._majorKey === col.key)">
                        <CellRenderer :col-data="colChild" :key="colChild.key" :row-data="item"/>
                      </td>
                    </template>
                    <td v-else-if="col.cellRenderer">
                      <CellRenderer :col-data="col" :key="col.key" :row-data="item"/>
                    </td>
                    <td v-else><el-text>{{ item[col.key] }}</el-text></td>

                  </template>
                </tr>
              </tbody>
            </table>
          </template>

          <template #loader="{  }">

            <table class="table-auto w-full border-1 min-h-96">
              <thead class="sticky top-0 bg-primary">
                <tr class="border-1 h-[50px]">
                  <template :key="col.key" v-for="col in (visibleColumns as any)">
                    <th v-if="!renderHeaderCell"><el-text>{{ col.title }}</el-text></th>
                    <template v-else-if="col.key.startsWith('_')">
                      <th
                        :key="col.key + (colChild.key as string)"
                       v-for="colChild in Object.values(columnsModel).filter(e => e._majorKey === col.key)" class="max-h-[50px]">
                        <el-badge v-if="colChild.headerCellRenderer" :type="colChild.headerCounterBadgeColor" :class="colChild.headerCounterBadgeClass" :value="colChild.headerCounterBadge" :hidden="colChild.headerCounterBadge === undefined">
                          <HeaderCellRenderer :col-data="colChild" :key="colChild.title"/>
                        </el-badge>
                        <el-badge v-else-if="colChild.icon || colChild.icons" :type="colChild.headerCounterBadgeColor" :class="colChild.headerCounterBadgeClass" :value="colChild.headerCounterBadge" :hidden="colChild.headerCounterBadge === undefined">
                          <el-tooltip effect="dark" :content="colChild.tooltip">
                            <IconIIcon v-if="colChild.icon" :icon="colChild.icon" :style="'color: var(' + colChild.iconColor + ')'" />
                            <div v-else-if="colChild.icons">
                              <IconIIcon v-for="icon in colChild.icons" :key="icon" :icon="icon" :style="'color: var(' + colChild.iconColor + ')'" />
                            </div>
                          </el-tooltip>
                        </el-badge>
                        <el-text v-else>{{ colChild.title || colChild.tooltip }}</el-text>
                      </th>
                    </template>
                    <th v-else-if="col.headerCellRenderer">
                      <el-badge :type="col.headerCounterBadgeColor" :class="col.headerCounterBadgeClass" :value="col.headerCounterBadge" :hidden="col.headerCounterBadge === undefined">
                        <HeaderCellRenderer :col-data="col" :key="col.title"/>
                      </el-badge>
                    </th>
                    <th v-else>
                      <el-text>{{ col.title }}</el-text>
                    </th>

                  </template>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in dataModel" :key="item[props.rowId]" :class="{ 'h-[50px]': true }" >
                  <template v-for="col in (visibleColumns as any)" :key="col.key">
                    <td><PSkeleton width="80%" height="1rem" /> </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </template>
        </PVirtualScroller>


      <!-- <PDataTable
        lazy
        v-if="dataModel.length > 0"
        ref="tableRef"
        scrollable scrollHeight="400px"
        tableStyle="width: 100%" size="small"
        class="bg-transparent "
        style="width: calc(100% - 5px)"
        resizableColumns
        :dataKey="props.rowId"
        :value="dataModel"
        :row-class="(d: any) => { return {
          '!w-full': true,
          'noHoverRow min-h-48 h-48': d && d.direction !== undefined,
          'align-bottom': d && d.direction === 'prev',
          'align-top': d && d.direction === 'next',
        }}"
        :highlight-on-select="false"
        v-model:selection="selection" :metaKeySelection="false"
        :sortField="tableData.value.sortBy" :sortOrder="tableData.value.sortDesc ? -1: 1"
        :virtual-scroller-options="(dataModel.length = props.totalItems) ? { itemSize: 46, showLoader: true, showSpacer: true } : undefined"
        @update:sort-field="log().log_colored('orange', 'sortfield changed')"
        @update:sort-order="log().log_colored('orange', 'sortorder changed')"
        @sort="onSort($event)"
        @row-click="rowEventHandlers.onClick"
        >
        <template #header>
          <div class="flex justify-content-between">
            <div>
              <h4>{{ props.id }}</h4>
            </div>
            <div class="flex">
              <SelectSColumnVisibility :table-id="props.id" v-model:possibleColumns="columnsModel" />
              <InputIFilter
              :data="tableData"

              :filterable-columns="Object.values(wrappedColumns)"
              @update="($event: any) => $emit('update-input-filter', $event)"
              />
            </div>
          </div>
        </template>
        <template #footer>
          <div class="flex flex-row-reverse space-x-4 space-x-reverse">
            <el-button
              size="small"
              @click="_fetch"
            ><IconIIcon :icon="icons.refetch" /></el-button>
            <el-pagination
              v-model:current-page="pageNumber"
              v-model:page-size="perPage"
              class="max-w-1/2 !inline-flex"
              :pager-count="5"
              :page-sizes="pagesSizes"
              :small="small"
              :disabled="false"
              :background="false"
              :layout="(pagesSizes.length <= 1) ? 'total' : ((props.totalItems / perPage) <= 1) ? 'total' : 'total, sizes, prev, pager, next'"
              :total="props.totalItems"
              @size-change="onPerPageChange"
              @current-change="onPage"
              />
          </div>
        </template>
        <div>
          <div v-for="col in (visibleColumns as any)" >
            <PColumn v-if="(col as any).key === 'selected'"
              :selectionMode="selectionStore.multiSelection === true ? 'multiple': 'single'"  headerStyle="width: 4rem"
              :class="col.class"
            >
              <template #loading>
                <div class="flex align-items-center" :style="{ height: '17px', 'flex-grow': '1', overflow: 'hidden' }">
                    <PSkeleton width="90%" height="1rem" />
                </div>
              </template>

              <template #header="slotProps">
                <ButtonBTNClearSelection @clearselection="clearSelection"/>
              </template>
              <template #body="scope">
                <div class="hidden">{{ (getSelectedrowIdsFromStore().includes(scope.data[props.rowId])) ? scope.data.selected = true : scope.data.selected = false }}</div>

                <div v-if="scope?.data?.dummy"></div>
                <el-checkbox v-else-if="selectionStore.multiSelection" v-model="scope.data.selected" class="selectionItem"/>
                <el-radio-group v-else v-model="scope.data.selected">
                  <el-radio :label="true" :value="true" class="selectionItem hide_label" />
                </el-radio-group>
              </template>
            </PColumn>

            <div v-else-if="(col as any).key.startsWith('_')">
              <div v-for="colChild in Object.values(columnsModel).filter(e => e._majorKey === col.key)">
              <PColumn
                :key="colChild.key" :field="colChild.key"
                :sortable="colChild.sortable"
                :header="colChild.title"
                  :class="{
                    '!w-1/1': colChild.maxWidth === undefined,
                    ['!min-w-' + colChild.minWidth + ' !w-' + colChild.minWidth]: colChild.minWidth !== undefined,
                    '': colChild._fixed === TableV2FixedDir.LEFT || colChild.fixed === TableV2FixedDir.LEFT || colChild.fixed === true || colChild._fixed === true,
                    'flex flex-row-reverse': colChild._fixed === TableV2FixedDir.RIGHT || colChild.fixed === TableV2FixedDir.RIGHT,
                    [(colChild.class as string)]: true,
                  }"
              >

                <template #loading>
                  <div class="flex align-items-center" :style="{ height: '17px', 'flex-grow': '1', overflow: 'hidden' }">
                      <PSkeleton width="60%" height="1rem" />
                  </div>
                </template>

                <template v-if="colChild.headerCellRenderer" #header="slotProps">
                  <el-badge :type="colChild.headerCounterBadgeColor" :class="colChild.headerCounterBadgeClass" :value="colChild.headerCounterBadge" :hidden="colChild.headerCounterBadge === undefined">
                    <HeaderCellRenderer :col-data="colChild" :key="colChild.title"/>
                  </el-badge>
                </template>
                <template v-else-if="colChild.icon || colChild.icons" #header>
                  <el-badge :type="colChild.headerCounterBadgeColor" :class="colChild.headerCounterBadgeClass" :value="colChild.headerCounterBadge" :hidden="colChild.headerCounterBadge === undefined">
                    <el-tooltip
                      effect="dark"
                      :content="colChild.tooltip"
                      >
                      <IconIIcon v-if="colChild.icon" :icon="colChild.icon" :style="'color: var(' + colChild.iconColor + ')'" />
                      <div v-else-if="colChild.icons">
                        <IconIIcon v-for="icon in colChild.icons" :icon="icon" :style="'color: var(' + colChild.iconColor + ')'" />
                      </div>
                    </el-tooltip>
                  </el-badge>
                </template>

                <template v-if="!renderCells" #body="slotProps">
                  <el-text>{{ slotProps.data[colChild.key] }}</el-text>
                </template>
                <template v-else-if="colChild.cellRenderer" #body="slotProps">
                  <el-text v-if="slotProps.data[props.rowId] && slotProps.data.dummy && colChild.key==props.rowId">
                    {{ slotProps.data[props.rowId] }}
                  </el-text>
                  <CellRenderer v-else-if="!slotProps.data.dummy" :col-data="colChild" :key="colChild.key" :row-data="slotProps.data"/>
                </template>
              </PColumn>
              </div>
            </div>
            <PColumn v-else
              :key="col.key" :field="col.key"
              :header="col.title"
              :sortable="col.sortable"
              :class="{
                '!w-1/1': col.maxWidth === undefined,
                'flex flex-row-reverse': col._fixed === TableV2FixedDir.RIGHT || col.fixed === TableV2FixedDir.RIGHT,
                [col.class]: true,
              }"
              :style=" (col.minWidth !== undefined) ? 'min-width: ' + col.minWidth + 'px;' : ''"
              >

              <template #loading>
                <div class="flex align-items-center" :style="{ height: '17px', 'flex-grow': '1', overflow: 'hidden' }">
                    <PSkeleton width="60%" height="1rem" />
                </div>
              </template>

              <template v-if="col.headerCellRenderer" #header="slotProps">
                <el-badge :type="col.headerCounterBadgeColor" :class="col.headerCounterBadgeClass" :value="col.headerCounterBadge" :hidden="col.headerCounterBadge === undefined">
                  <HeaderCellRenderer :col-data="col" :key="col.title"/>
                </el-badge>
              </template>
              <template v-else-if="col.icon && col.tooltip" #header>
                <el-badge :type="col.headerCounterBadgeColor" :class="col.headerCounterBadgeClass" :value="col.headerCounterBadge" :hidden="col.headerCounterBadge === undefined">
                <el-tooltip
                  effect="dark"
                  :content="col.tooltip"
                  placement="bottom-end"
                >
                <el-text><IconIIcon :icon="col.icon" :class="col.iconClass" :style="'color: var(' + col.iconColor + ')'" /></el-text>
                </el-tooltip>
                </el-badge>
              </template>
              <template v-else-if="col.icons && col.tooltip" #header>
                <el-badge :type="col.headerCounterBadgeColor" :class="col.headerCounterBadgeClass" :value="col.headerCounterBadge" :hidden="col.headerCounterBadge === undefined">
                  <el-tooltip
                    effect="dark"
                    :content="col.tooltip"
                    placement="bottom-end"
                  >
                    <el-text>
                      <IconIIcon v-for="icon in col.icons" :icon="icon" :style="'color: var(' + col.iconColor + ')'" />
                    </el-text>
                  </el-tooltip>
                </el-badge>
              </template>
              <template v-else-if="col.title" #header="slotProps">
                <el-badge :type="col.headerCounterBadgeColor" :class="col.headerCounterBadgeClass" :value="col.headerCounterBadge" :hidden="col.headerCounterBadge === undefined">
                  <el-text>{{ col.title }}</el-text>
                </el-badge>
              </template>
              <template v-else #header="slotProps">
                <el-badge :type="col.headerCounterBadgeColor" :class="col.headerCounterBadgeClass" :value="col.headerCounterBadge" :hidden="col.headerCounterBadge === undefined">
                  <el-text>{{ col.key }}</el-text>
                </el-badge>
              </template>

              <template v-if="!renderCells" #body="slotProps">
                  <el-text>{{ slotProps.data[col.key] }}</el-text>
              </template>
              <template v-else-if="col.cellRenderer" #body="slotProps">
                <el-text v-if="slotProps.data[props.rowId] && slotProps.data.dummy && col.key==props.rowId"
                  class="min-h-24"
                >
                  {{ slotProps.data[props.rowId] }}
                </el-text>
                <CellRenderer v-else-if="!slotProps.data.dummy" :col-data="col" :key="col.key" :row-data="slotProps.data"/>
              </template>
              <template v-else #body="slotProps">
                <el-text>{{ slotProps.data[col.key] }}</el-text>
              </template>
            </PColumn>
          </div>
        </div>
      </PDataTable> -->
    </div>

    <LazyContextmenuCMTable
      ref="menu"
      :item="currentSelectedRow"
      :row-id="props.rowId"
      :type="props.id"
      @refetch="$emit('fetch')"
    />
  </div>
</template>

<script lang="tsx" setup>
// tsx used to create components inside ts code (see columns[...].cellRenderer)
import { useIcons } from '~/composables/mixins/useIcons'
// import type { SortState } from 'element-plus'
import type { RowEventHandlerParams } from 'element-plus'
import type { ITableHeaderRow } from '~/types/ttableV3'
import type { TRowData } from '~/types/Datatypes'
import type { ITableData } from '~/types/ttable'
// import Column from 'primevue/column'
// import ColumnGroup from 'primevue/columngroup'   // optional
// import Row from 'primevue/row'                   // optional
import { useUtilsData } from '~/composables/mixins/useUtilsData'
import type { IObjectString2Any } from '~/types/tgeneral'
// import TDefaultDesktopColumn from './TDefaultDesktopColumn'

const CellRenderer = (attributes: any): VNode => {
// const CellRenderer = ({key, 'row-data', colData}: any): VNode => {
  const colData  = attributes['col-data'] || attributes.colData
  const rowData = attributes['row-data'] || attributes.rowData

  if (!colData) {
    console.warn(`CellRenderer: col-data not found in: ${JSON.stringify(attributes)}`)
    return <el-text>undefined</el-text>
  }
  if (colData.cellRenderer) {
    return colData.cellRenderer({rowData})
  }
  return <el-text>{ attributes.key }</el-text>
}

const HeaderCellRenderer = (attributes: any): VNode => {
  const colData  = attributes['col-data'] || attributes.colData
  if (!colData) {
    console.warn(`HeaderCellRenderer: col-data not found in: ${JSON.stringify(attributes)}`)
    return <el-text>undefined</el-text>
  }
  if (colData.headerCellRenderer){
    // console.warn('HeaderCellRenderer of obj.col-data: ', colData, colData.headerCellRenderer)
    return colData.headerCellRenderer()
  }
  return <el-text>{ colData.title }</el-text>
}

const settings = storeSettings()
const selectionStore: IObjectString2Any = storeSelections()
// const tableStore = storeTablesettings()
const icons = useIcons()

const columnsModel = defineModel<ITableHeaderRow>('columns', { required:true})
const dataModel = defineModel<Array<any>>('data', { required:true})
const tableData = defineModel<ITableData>('tabledata', { required:true})

const $emit = defineEmits(['fetch', 'selection-changed', 'selection-clear', 'tabledata-changed', 'sort-changed', 'update-input-filter'])
const props = defineProps({
  // columns: { type: Object as PropType<ITableHeaderRow>, required:true},
  // data: { type: Array<any>, required: true },
  // tableData: { type: Object as PropType<ITableData>, required: true },
  totalItems: { type: Number, required: true },
  id: { type: String, default: 'servers' },
  rowId: { type: String, default: 'depotId' },
  sortBy: { type: String, default: 'selection'},
  small: { type: Boolean, default: true },
  isLoading: { type: Boolean, default: false, required:false },
})
const renderCells = ref(true)
const renderHeaderCell = ref(true)
// const tableRef = ref()
const menu = ref()
const currentSelectedRow = ref<TRowData|undefined>()
const selectKey = ref<string>( props.id === 'servers' ? 'selectionDepots': (props.id === 'clients' ? 'selectionClients' : 'selectionProducts'))

const wrappedColumns = ref<ITableHeaderRow>({})
// const wrappedData = ref<Array<any>>([])

const perPage = ref(tableData.value.perPage) // computed(()=> tableData.value.perPage)
// const pageNumber = ref(tableData.value.pageNumber) // computed(()=> tableData.value.pageNumber)
const _pagesSizes = [10, 20, 50, 100]
const pagesSizes = ref(_pagesSizes)
updateMaxPerPage()
const lastSelectedItemForSingleselect = ref<any>(undefined)

// const sortState = ref<SortState>({ [props.sortBy]: TableV2SortOrder.DESC })

// const lastScrollDirection = ref<'next'|'prev'|''>('')

// const cmmenu = ref()
// const cmmenuItems = ref([
//   { label: 'onDemand', icon: 'pi pi-fw pi-pencil', command: () => { console.log('Edit') } },
//   { label: 'notify', icon: 'pi pi-fw pi-trash', command: () => { console.log('Delete') } },
//   { label: 'reboot', icon: 'pi pi-fw pi-refresh', command: () => { console.log('Refresh') } },
//   { label: 'dca', icon: 'pi pi-fw pi-trash', command: () => { console.log('Delete') } },
//   { label: 'rename', icon: 'pi pi-fw pi-trash', command: () => { console.log('Delete') } },
//   { label: 'remove', icon: 'pi pi-fw pi-trash', command: () => { console.log('Delete') } },
// ])

// rowEventHandlers.onClick
const rowEventHandlers: any = {
  onClick: (params: any) => {


    if (params && params.originalEvent
      && params.originalEvent.target.localName !== "td" // is not a tablecell (raw text)
      && !(params?.originalEvent?.target?.__vueParentComponent?.attrs?.class?.includes('selectionItem')) // is not the selection cell
    ) {
      return
    }
    const rowData:TRowData  = params.rowData || params.data || params
    if (rowData.dummy === true && rowData.direction === undefined) {
      return
    } else if (rowData.dummy === true) {
      // onScroll(rowData.direction)
      return
    }
    const isAlreadyInStore = selectionStore['_'+selectKey.value].includes(rowData[props.rowId])
    if (selectionStore.multiSelection === false) {
      if (lastSelectedItemForSingleselect.value !== undefined) {
        lastSelectedItemForSingleselect.value.selected = false
      }
      lastSelectedItemForSingleselect.value = rowData
      rowData.selected = true
    }
    else {
      rowData.selected = rowData.selected === true ? false : true
    }

    $emit('selection-changed', rowData[props.rowId])
    const isAlreadyInStore2 = selectionStore['_'+selectKey.value].includes(rowData[props.rowId])
    // alert('selection-changed: ' + rowData[props.rowId])
    console.warn('selection-changed: ' + rowData[props.rowId] + ' isAlreadyInStore: ' + isAlreadyInStore + ' isAlreadyInStore2: ' + isAlreadyInStore2)

  },
  onDblclick: () => {
    // const rowData:TRowData  = params.rowData
  },
  onContextmenu: (params: RowEventHandlerParams) => {
    // const { x, y, sourceType } = useMouse()

    // console.log("params: ", params)
    // console.log("x: ", x.value, "y: ", y.value)
    // console.log(cmmenu.value.$style)
    // cmmenu.value.$style.css = `top: ${y.value}px !important; left: ${x.value}px !important;`
    const rowData:TRowData  = params.rowData
    currentSelectedRow.value = rowData

    menu.value.show(params.event)
    // menu.value.show()
    // cmmenu.value.show(params)
  },
}


// const lazyLoading = ref(true);
// const loadLazyTimeout = ref();

// const virtualScrollerOptions = ref({ lazy: true, onLazyLoad: onVirtualScrollerLoad, itemSize: 10, delay: 500, showLoader: false, loading: lazyLoading, numToleratedItems: perPage.value / 2 })


const selection = ref<Array<string>>(getSelectedrowsFromStore())
// const _visibleColumnsDataKeys = computed(()=> useUtilsData().getVisibleColumnIds(Object.values(columnsModel.value)) )
// const visibleColumns = computed(()=> Object.values(columnsModel.value).filter((c:any) => (c._majorKey === undefined) ? _visibleColumnsDataKeys.value.includes(c.dataKey) : _visibleColumnsDataKeys.value.includes(c._majorKey) ))
const columnValues = computed(()=> Object.values(columnsModel.value))
const visibleColumns = computed(()=> useUtilsData().getVisibleColumnsInTable(columnValues.value) )
// const visibleColumns = computed(()=> Object.values(columnsModel.value).filter((c:any) => c.fixed === true || c._fixed === true || c.hidden === false))


// numVisibleColumns.value < numFixedColumns.value + numVisibleColumnsDelta.value
// const numVisibleColumns = computed(()=> Object.values(visibleColumns.value).length)
// const numFixedColumns = computed(()=> Object.values(visibleColumns.value).filter((c:any) => Boolean(c.fixed) === true || Boolean(c._fixed) === true).length)
// const numVisibleColumnsDelta = ref(1)

// watch(()=>tableData.value.pageNumber, (val)=>{ pageNumber.value = val })
// watch(()=>tableData.value.perPage, (val)=>{ perPage.value = val })


// watch(()=>tableStore[props.id + 'Columns'], ()=>{
//   _fixMajorVisibility()
// }, { deep: true})
// _fixMajorVisibility()
// function _fixMajorVisibility() {
//   Object.values(wrappedColumns.value)
//     .filter((e:any) => e.dataKey.startsWith('_')) // only majors
//     .map((e:any)=> {
//       const majorKey = e.dataKey
//       const children = Object.values(wrappedColumns.value).filter(e => e._majorKey === majorKey).map(e => e.dataKey as string)
//       // const visible = tableStore.columns[props.id].includes(e.dataKey)
//       const visible = tableStore[props.id + 'Columns'].includes(e.dataKey)
//       console.log('majorKey', majorKey, 'visible', visible, 'children', children)
//       if (visible){ // is major visible? // show major.chilrden
//         wrappedColumns.value[majorKey].hidden = true
//         children.map((cId:string)=> wrappedColumns.value[cId].hidden = false)
//       } else { // hide mahor.chilrden
//         children.map((cId:string)=> wrappedColumns.value[cId].hidden = true)
//       }
//     }
//   )
//   // log not hidden columns
// }
// watch (()=> columnsModel.value)

watch (()=>props.totalItems, updateMaxPerPage)

watch (()=>dataModel, ()=>{ selection.value = getSelectedrowsFromStore() }, {deep: true})

// function updateColumns() {
  //   if (columnsModel.value == undefined) return {}

  //   // const _columns: ITableHeaderRow = JSON.parse(JSON.stringify(props.columns))
  //   const _columns: ITableHeaderRow = {...columnsModel.value}
  //   Object.values(_columns)
  //     .map(c => {
  //       if (c.cellRenderer === undefined)
  //         c.cellRenderer = ({rowData,cellData}: CellRendererParams<any>) => {
  //           if (rowData)
  //             return <el-text>{rowData[c.dataKey || c.key]}</el-text>
  //           return <el-text > XX </el-text>
  //       }
  //       else {
  //         const renderer = c.cellRenderer
  //         c.cellRenderer = ({rowData}: any) => {
  //           if (rowData && rowData.dummy === undefined)
  //             return renderer({rowData} as any)
  //           else if (rowData && rowData.dummy === true && c.dataKey === props.rowId)
  //             return <div contenteditable="true">{rowData[props.rowId]}</div>
  //             // return <el-text >b {rowData[props.rowId]} </el-text>
  //           return <el-text />
  //         }
  //       }
  //     } )
  //   if (columnsModel.value?.selected === undefined) {
  //     return _columns
  //   }
  //   _columns.selected.headerCellRenderer = () => {
  //     const _data = unref(dataModel)
  //     // const allSelected = _data.every((row: any) => row.selected)
  //     // const containsChecked = _data.some((row: any) => row.selected)
  //     const clearSelection = (event:any) => {
  //       $emit('selection-clear')
  //       dataModel.map((row:any) => {
  //         row.selected = false
  //         return row
  //       })
  //     }
  //     return (
  //       <buttonBTNClearSelection onClearselection={clearSelection}/>
  //     )
  //   }
  //   // _columns.selected.cellRenderer = ({ rowData }) => {
  //   //   const selected = computed<boolean>(()=> selectionInStoreByType.value.includes(rowData[props.rowId]) || rowData.selected)
  //   //   const onChange = (value: CheckboxValueType) => {
  //   //     rowData.selected = value
  //   //     $emit('selection-changed', rowData[props.rowId])
  //   //   }
  //   //   // return <SelectionCell show={false} value={selected.value} onChange={onChange} />
  //   //   return <SelectionCell show={rowData.dummy !== true} value={selected.value} onChange={onChange} />
  //   // }
  //   return _columns
// }

// function updateCurrentPage(pageNo: number) {
//   pageNumber.value = pageNo
//   $emit('tabledata-changed', {...tableData, pageNumber: pageNo})
//   $emit('fetch')
// }
// function updatePerPage(perPage: number) {
//   $emit('tabledata-changed', {...tableData, perPage, pageNumber: 1})
//   $emit('fetch')
// }
// function updateData() {
//   if (dataModel === undefined) return []
//   const _data = dataModel
//   return _data
// }

// const lastFetchedDirection = ref<'next'|'prev'>('next')
// const middleOfTable = ref<number>(50 + 150)

// watch(()=>tableData.value._lastScrollDirection, ()=> {
//   // scroll to element if lastScrollDirection is set to 'prev'
//   if (tableData.value._lastScrollDirection === undefined) { return }
//   else if (tableData.value._lastScrollDirection === '') { return }
//   else if (tableData.value._lastScrollDirection === 'next') { return }
//   else if (tableData.value._lastScrollDirection !== 'prev') {
//     console.error('no such direction', tableData.value._lastScrollDirection)
//     return
//   }
//   tableData.value._lastScrollDirection = ''
//   const items = dataModel.value.filter(x => x.dummy !== true).length
//   const visiblePages =  Math.ceil(items / perPage.value)

//   if (visiblePages > 1) {
//     scrollToRow(tableData.value.perPage)
//   }
// })

function _fetch() {
  $emit('fetch')
  // if (tableData.value.pageNumber > 1) scrollToRow(1, 500)
}


function updateMaxPerPage () {
  // const _pagesSizes = [1, 5, 10, 20, 50, 100, 1000]
  let sizes: number[] = JSON.parse(JSON.stringify(_pagesSizes))
  sizes.push(props.totalItems)
  sizes.sort((a, b) => a - b)
  sizes = sizes.filter((e: number) => e <= props.totalItems)

  if (props.totalItems) perPage.value = props.totalItems
  if (props.totalItems && props.totalItems < 10) {
    pagesSizes.value = [props.totalItems]
    return
  }
  pagesSizes.value = sizes
}

// function scrollToRow(rowNumber: number, timeout: number=100, behavior: 'auto'|'smooth'|'instant'='instant', block: 'start'|'center'|'end'|'nearest'='start') {
//   setTimeout(() => {
//     var rows = document.querySelectorAll('[data-pc-section="bodyrow"]');
//     const last_first_row = rows[rowNumber]
//     if (last_first_row === undefined) {
//       return
//     }
//     // line is the row number that you want to see into view after scroll
//     last_first_row.scrollIntoView({ behavior, block });
//   }, timeout);
// }

// TODO:
// - add scroll (real scroll)
// - fix table column visibility
//    - check major columns



function getSelectedrowsFromStore() {
  const _selection: any = []
  for (const rId of selectionStore['_'+selectKey.value]) {
    const row = dataModel.value.find((r: any) => r && r[props.rowId] === rId)
    if (row !== undefined)
      _selection.push(row)
  }
  return _selection
}
// function getSelectedrowIdsFromStore() {
//   return getSelectedrowsFromStore().map((r: any) => r && r[props.rowId])
// }


// async function onScroll(event: any) {

//   const tData = JSON.parse(JSON.stringify(tableData))
//   if (event === 'next' && lastScrollDirection.value === 'prev') {
//     tData.pageNumber = tableData.value.pageNumber + 2
//   }
//   else if (event === 'prev' && lastScrollDirection.value === 'next') {
//     tData.pageNumber = tableData.value.pageNumber - 2
//   }
//   else {
//     tData.pageNumber = tableData.value.pageNumber + ((event === 'next') ? 1 : -1)
//   }

//   pageNumber.value = tData.pageNumber
//   await $emit('tabledata-changed', tData)
//   await $emit('fetch', event)
//   lastScrollDirection.value = event
// }

// function onPerPageChange(event: any) {
//   if (event === tableData.value.perPage) {
//     return
//   }
//   // loadCarsLazy(event)
//   const tData = JSON.parse(JSON.stringify(tableData))
//   tData.perPage = event
//   tData.pageNumber = 1
//   lastScrollDirection.value = ''
//   $emit('tabledata-changed', tData)
//   _fetch()
// }
// function onPage(newPageNumber: any) {
//   // loadCarsLazy(event)
//   const tData = JSON.parse(JSON.stringify(tableData))
//   // tData.pageNumber = newPageNumber/tData.perPage + 1 // Paginator from primeVue
//   tData.pageNumber = newPageNumber // paginator from element-plus
//   lastScrollDirection.value = ''
//   $emit('tabledata-changed', tData)
//   _fetch()
// }

function onSort(event: any) {
  const tData = JSON.parse(JSON.stringify(tableData))
  tData.sortBy = event.sortField

  // tData.sortDesc = event.sortDesc
  tData.sortDesc = !event.sortDescOld
  // console.log('sortBy', event.sortField, 'sortDescOld', event.sortDescOld, 'sortDesc', tData.sortDesc)
  tData.pageNumber = 1
  $emit('tabledata-changed', tData)
  // _fetch()
  // $emit('sort-changed', {
  //   key: event.sortField,
  //   isDesc: event.sortOrder === -1
  // })
}

// async function onVirtualScrollerLoad (event: any) {
  // lazyLoading.value = true;
  // // if (event.first === 0 && event.last === 0) {
  // //   lazyLoading.value = false;
  // //   return
  // // }
  // const items = dataModel.value.filter(x => x.dummy !== true).length
  // const pageNumber = Math.ceil((items===0)? 1 : items / perPage.value)
  // if (event.first === 0 && event.last === 0) {
  //   lazyLoading.value = false;
  //   return
  // }
  // if (items != 0 && event.first == 0) {
  //   lazyLoading.value = false;
  //   return
  // }
  // const tData = JSON.parse(JSON.stringify(tableData))
  // tData.pageNumber = pageNumber
  // $emit('tabledata-changed', tData)
  // $emit('fetch', 'next')
// }
//   if (event.last === 0 && event.first === 0) {
//     lazyLoading.value = false;
//     return
//   }

//   // !lazyLoading.value && (lazyLoading.value = true);
//   if (loadLazyTimeout.value) {
//     clearTimeout(loadLazyTimeout.value);
//   }

//   loadLazyTimeout.value = setTimeout(async () => {


//   const pageNo = event.first / event.rows + 1
//   const tData = JSON.parse(JSON.stringify(tableData))
//   tData.pageNumber = pageNo

// // //     !lazyLoading.value && (lazyLoading.value = true);

//     // if (loadLazyTimeout.value) {
//     //     clearTimeout(loadLazyTimeout.value);
//     // }
// // const tData = JSON.parse(JSON.stringify(tableData))
// //   if (event.sortField) {
// //     tData.sortBy = event.sortField
// //     tData.sortDesc = event.sortOrder === -1
// //     tData.pageNumber = 1
// //   }
// //   if (event.page) {
// //     tData.perPage = event.rows
// //     tData.pageNumber = event.page + 1
// //     // tableData.value.
// //   }
// //   console.warn('loadCarsLazy1', tData)
// //   $emit('tabledata-changed', tData)
// //   console.warn('loadCarsLazy2', tData)
// //   // tableData.value.pageNumber = event.page + 1
// //   // tableData.value.sortBy = event.sortField ? event.sortField : tableData.value.sortBy
// //   // tableData.value.sortDesc = event.sortOrder === -1
//   await $emit('fetch');
//   lazyLoading.value = false;
// }, 1000);
// // //     // //simulate remote connection with a timeout
// // //     // loadLazyTimeout.value = setTimeout(() => {
// // //     //     let _virtualCars = [...virtualCars.value];
// // //     //     let { first, last } = event;

// // //     //     //load data of required page
// // //     //     const loadedCars = cars.value.slice(first, last);

// // //     //     //populate page of virtual cars
// // //     //     Array.prototype.splice.apply(_virtualCars, [...[first, last - first], ...loadedCars]);

// // //     //     virtualCars.value = _virtualCars;
// // //     //     lazyLoading.value = false;
// // //     // }, Math.random() * 1000 + 250);
// }

// function clearSelection (event:any) {
//   $emit('selection-clear')
//   dataModel.value.map((row:any) => {
//     row.selected = false
//     return row
//   })
// }
// function getColumnStyle(col: any) {
//   if (col === undefined) return ''
//   let style = ""
//   const isLeft = col._fixed === TableV2FixedDir.LEFT || col.fixed === TableV2FixedDir.LEFT || col.fixed === true || col._fixed === true
//   const isRight = col._fixed === TableV2FixedDir.RIGHT || col.fixed === TableV2FixedDir.RIGHT
//   const isFixed = isLeft || isRight
//   if (col.width !== undefined) {
//     if (isLeft) {
//       style += 'width: ' + col.width + 'px; background-color: red;'
//       style += 'min-width: ' + col.width + 'px; background-color: green;'
//       if (numVisibleColumns.value < numFixedColumns.value + numVisibleColumnsDelta.value) style += 'width:100%;'
//     }else {
//       style += 'width: ' + col.width + 'px; background-color: red;'
//     }
//   }
//   if (col.maxWidth !== undefined) style += 'max-width: ' + col.maxWidth + 'px;'
//   if (col.minWidth !== undefined && !isFixed) style += 'min-width: ' + col.minWidth + 'px;'
//   return style
//   // return (Boolean(col._fixed) !== false || Boolean(col.fixed) !== false) ? 'min-width: ' + col.width + 'px;' : ''
// }
</script>


<style scoped>
:deep(.noHoverRow){
  --bg-color-hover: transparent;
}
:deep(.p-column-header-content .p-checkbox) {
  display: none;
}
:deep(.p-datatable .p-datatable-thead > tr > th .p-column-title) {
  display: none !important;
}
:deep(.p-datatable .p-sortable-column .p-sortable-column-icon) {
  color: var(--fg-color) !important;
}
:deep(.hide_label .el-radio__label) {
  display: none !important;
}
:deep(.p-paginator),
:deep(.p-datatable .p-datatable-wrapper),
:deep(.p-datatable .p-datatable-footer),
:deep(.p-datatable .p-datatable-thead),
:deep(.p-datatable .p-datatable-tbody),
:deep(.p-datatable  tr),
:deep(.p-datatable .p-datatable-header) {
  background-color: transparent !important;
}
:deep(.p-datatable  tr > th){
  background-color: var(--bg-color);
}

:deep([data-pc-section="pagebutton"][data-p-highlight="true"]),
:deep(.p-datatable  tr:hover),
:deep(.p-datatable  tr > th:hover){
  background-color: var(--bg-color-hover) !important;
}

:deep(.p-column-header-content [data-pc-name="checkbox"][data-pc-section="root"]) {
  display: none !important;
}
</style>
