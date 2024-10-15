<script setup lang="tsx">
import {loginlogout} from '~/histoire/histoire-utils'
import {generateColumns, generateData, generateNumbers, generateTableData} from '~/histoire/histoire-utils-data'
import TDefault from './TDefault.vue'
const itemsLength = 100

const _columns = generateColumns(4)
const columns: any = {
  selected: {key: 'selected',
        id: 'selected',
        parentId: null,
        dataKey: 'selected',
        title: `selected`,
        fixed: true,
        width: 50},
  ..._columns,
  nr: {key: 'nr',
        id: 'nr',
        parentId: null,
        dataKey: 'nr',
        title: `nr`,
        itemOf: generateNumbers(itemsLength),
        cellRenderer: ({rowData}: any) => {return <el-tag>{rowData.nr}</el-tag>},
        width: 50},
}
columns['column-0'].fixed = true
columns['column-1'].hidden = true
const data = generateData(columns, itemsLength)
const mylog = (s:any)=> {}
const tableData = generateTableData('column-0')
const totalItems = data.length

const MyTDefault = ({ isMobile }: any) => {
  return <TDefault
        id={'tableId-' + isMobile?'mobile':'desktop'}
        columns={columns}
        tableData={tableData}
        totalItems={totalItems}
        data={data}

        sort-by={undefined}
        rowId="column-0"
        is-mobile={isMobile}
        onSelection-changed={(x:string)=>mylog('change ' + JSON.stringify(x))}
        onSelection-clear={()=>mylog('clear')}
    />
}

</script>

<template>
  <Story :setup-app="loginlogout">
    <Variant title="mobile" :meta="{ wrapperMobile: true }" responsive-disabled>
      <MyTDefault :is-mobile="true"/>
      <!-- <TableTDefault
        id="tableId"
        :columns="columns"
        :data="data"
        :sort-by="undefined"
        rowId="column-0"
        @selection-changed="(id: string) => {}"
        @selection-clear="() => { }"
      /> -->
    </Variant>
    <Variant title="desktop" responsive-disabled>
      <MyTDefault :is-mobile="false"/>
      <!-- <TableTDefault
        id="tableId"
        :columns="columns"
        :data="data"
        :sort-by="undefined"
        rowId="column-0"
        @selection-changed="(id: string) => {}"
        @selection-clear="() => { }"
      /> -->
    </Variant>
  </Story>
</template>