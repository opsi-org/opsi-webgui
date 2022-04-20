<template>
  <div data-testid="TBVTable" class="TBVTable" :class="{ mobile: $mq=='mobile' }">
    <p v-if="error">
      {{ error }}
    </p>
    <b-table
      v-else
      :class="type"
      class="bvtable"
      v-bind="$props"
      :thead-class="noheader? 'table-header-none' : ''"
      :filter="filter"
      :filter-included-fields="filterfields"
      small
      :hover="hover"
      :items="items"
      :fields="fields"
      :stacked="stacked"
      show-empty
      responsive
      borderless
      :busy="isLoading"
    >
      <template #table-busy>
        <IconILoading />
      </template>
      <template #empty>
        --
      </template>
      <template #head()="data">
        <small> <b>{{ data.label }} </b> </small>
      </template>
      <template #cell()="row">
        <label :for="row.field.label" class="sr-only">  {{ row.field.label }} </label>
        <b-form-input
          :id="row.field.label"
          v-model="row.value"
          :aria-label="row.value"
          type="text"
          size="sm"
          readonly
        />
      </template>
      <template
        v-for="slotName in Object.keys($scopedSlots)"
        #[slotName]="slotScope"
      >
        <slot :name="slotName" v-bind="slotScope" />
      </template>
    </b-table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class BVTable extends Vue {
  @Prop({ }) error?: string
  @Prop({ }) type?: string
  @Prop({ }) isLoading?: boolean
  @Prop({ }) stacked?: boolean
  @Prop({ }) hover?: boolean
  @Prop({ }) noheader?: boolean
  @Prop({ }) filter?: string
  @Prop({ }) filterfields?: Array<string>
  @Prop({ }) items!: Array<object>
  @Prop({ }) fields!: Array<object>
}
</script>

<style>
.TBVTable:not(.mobile) .productproperties tr > td {
  padding-bottom: 5px;
}
.TBVTable.mobile .productproperties tr > td {
  /* display: block; */
  width: 100%;
  display: block;
  min-width: 100%!important;
}
.TBVTable.mobile .productproperties tr > td:first-of-type {
  padding-bottom: 0px;
}
.TBVTable.mobile .productproperties tr > td:last-of-type {
  padding-left: 40px;
  padding-top: 0px;
}
.table-header-none{
  display: none;
}

.bvtable:not(.small) .table.b-table.b-table-stacked > tbody > tr > [data-label]::before {
  width: 35%;
  font-weight: normal;
}
/* .bvtable_small.table-responsive {
  max-height: 200px;
  overflow-y: auto;
} */

.TBVTable {
  min-height: 200px;
  /* max-height: 610px; */
  overflow-y: auto;
}
</style>
