<template>
  <div>
    <BarBPageHeader
      navbartype="collapse"
      :collapsed="visible"
      :aria-controls="title+'-collapse'"
      :aria-expanded="visible"
      :title="title"
      @click.native="visible = !visible"
    />
    <b-collapse :id="title+'-collapse'" v-model="visible" accordion="table-accordion">
      <TableTTable v-bind="$props" :tabledata="tabledata">
        <template
          v-for="slotName in Object.keys($scopedSlots)"
          #[slotName]="slotScope"
        >
          <slot :name="slotName" v-bind="slotScope" />
        </template>
      </TableTTable>

      <slot name="pagination" />
    </b-collapse>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'nuxt-property-decorator'
import TTable from './TTable.vue'
import { ITableData } from '@/.utils/types/ttable'

@Component
export default class TCollapseable extends TTable {
  @Prop({ }) title!: string
  @Prop({ }) tabledata!: ITableData
  visible: Boolean = true
}

</script>
