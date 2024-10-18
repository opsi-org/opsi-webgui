<script setup lang="ts">
/*
import { data } from '../../.utils/storybook/mock'

export default {
  title: 'Input/I Filter',
  parameters: { docs: { description: { component: 'Input for filter' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<InputIFilter :data="args.tableInfo" :additional-title="args.title" />'
})

export const IFilter = PrimaryTemplate.bind({})
IFilter.args = {
  title: 'title',
  tableInfo: data.tableInfo
}
*/

// import { loginlogout } from '~/histoire/histoire-utils';
// import {generateColumns, generateNumbers} from '~/histoire/histoire-utils-data'
import {generateColumns} from '~/histoire/histoire-utils-data'
// import TTheme from '~/components/test/Theme.vue'
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
        width: 50},
}
const data = {
  tableInfo: {
    filterQuery: 'defaultFilterString',
    filterColumns: ['nr'],
    sortBy: 'a',
    sortDesc: false,
    pageNumber: 0,
    perPage: 0,
  },
}

</script>


<template>
  <!-- :setup-app="loginlogout" -->
  <Story
    :layout="{ type: 'grid', width: '100%' }"
    >
    <Variant title="mobile" :meta="{ wrapperMobile: true }" responsive-disabled>
      <InputIFilter
        :data="data.tableInfo"
        :filterable-columns="Object.values(columns)"
        @update="(v:any)=> {
          data.tableInfo.filterColumns = v.cols
          data.tableInfo.filterQuery = v.vals
        }"
      />
    </Variant>

    <Variant title="desktop" responsive-disabled>
      <!-- <TTheme /> -->
      <InputIFilter
        :data="data.tableInfo"
        :filterable-columns="Object.values(columns)"
        @update="(v:any)=> {
          data.tableInfo.filterColumns = v.cols
          data.tableInfo.filterQuery = v.vals
        }"
      />
    </Variant>
  </Story>
</template>
