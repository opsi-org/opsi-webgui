<template>
  <div data-testid="TCollapseableForMobile">
    <b-card
      v-if="collapseable"
      bg-variant="transparent"
      class="TCollapseableForMobile-Card overflow-auto"
    >
      <BarBPageHeader
        navbartype="collapse"
        :collapsed="visibleLocal"
        :aria-controls="title+'-collapse'"
        :aria-expanded="visibleLocal"
        :title="title"
        @click.native="visibleLocal = !visibleLocal"
      />
      <b-collapse :id="title+'-collapse'" v-model="visibleLocal" accordion="table-accordion">
        <div class="BarBPageHeader-row">
          <slot name="filter" />
          <DropdownDDTableColumnVisibilty v-if="$mq=='mobile' && collapseable" :headers="headers" />
        </div>
        <p v-if="$props.errorText">
          {{ $props.errorText }}
        </p>
        <TableTTable v-else v-bind="$props" :tabledata="tabledata">
          <template
            v-for="slotName in Object.keys($scopedSlots)"
            #[slotName]="slotScope"
          >
            <slot :name="slotName" v-bind="slotScope" />
          </template>
        </TableTTable>

        <slot name="pagination" />
      </b-collapse>
    </b-card>
    <b-card v-else bg-variant="transparent" class="TCollapseableForMobile-Card overflow-auto">
      <p v-if="$props.errorText">
        {{ $props.errorText }}
      </p>
      <TableTTable v-bind="$props" :tabledata="tabledata">
        <template
          v-for="slotName in Object.keys($scopedSlots)"
          #[slotName]="slotScope"
        >
          <slot :name="slotName" v-bind="slotScope" />
        </template>
      </TableTTable>
      <slot name="pagination" />
    </b-card>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'nuxt-property-decorator'
import TTable from './TTable.vue'
import { ITableData } from '@/.utils/types/ttable'

@Component
export default class TCollapseableForMobile extends TTable {
  @Prop({ }) tableId!: string
  @Prop({ }) title!: string
  @Prop({ }) tabledata!: ITableData
  @Prop({ default: true }) collapseable?: Boolean
  @Prop({ default: true }) visible?: Boolean

  visibleLocal: Boolean = true

  beforeMount () {
    this.visibleLocal = this.visible!
  }
}

</script>
<style>

.TCollapseableForMobile-Card {
  margin-bottom: 15px;
}
.TCollapseableForMobile-Card > .card-body{
  padding-top:0px;
  padding-bottom:0px;
  padding-left:0px;
  padding-right:0px;
}
.BarBPageHeader-row > .filter,
.BarBPageHeader-row > .dropdown {
  display: inline-block;
}
</style>
