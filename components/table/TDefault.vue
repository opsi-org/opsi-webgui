<template>
  <div data-testid="TDefault" class="TDefault" :class="{ mobile: $mq=='mobile' }">
    <p v-if="error" />
    <b-table
      v-else
      :class="type"
      class="bvtable"
      v-bind="$props"
      :thead-class="noheader? 'table-header-none' : ''"
      :filter="filter"
      :filter-included-fields="filterfields"
      :hover="hover"
      :items="items"
      :fields="fields"
      :stacked="stacked"
      small
      show-empty
      responsive
      borderless
    >
      <template #empty>
        --
      </template>
      <template #head()="data">
        {{ data.label }}
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
    <b-overlay :show="isLoading" no-wrap opacity="0.5" />
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
.TDefault:not(.mobile) .productproperties tr > td {
  padding-bottom: 5px;
}
.TDefault.mobile .productproperties tr > td {
  /* display: block; */
  width: 100%;
  display: block;
  min-width: 100%!important;
}
.TDefault.mobile .productproperties tr > td:first-of-type {
  padding-bottom: 0px;
}
.TDefault.mobile .productproperties tr > td:last-of-type {
  padding-left: 40px;
  padding-top: 0px;
}
.table-header-none{
  display: none;
}
.bvtable .table.b-table.b-table-stacked > tbody > tr > [data-label]::before {
  content: attr(data-label);
  width: 20%;
  float: left;
  text-align: left;
  word-wrap: break-word;
  font-weight: normal;
  font-style: normal;
  padding: 0 calc(1rem / 2) 0 0;
  margin: 0;
}

.bvtable .table.b-table.b-table-stacked > tbody > tr > [data-label] > div {
  display: inline-block;
  width: calc(100% - 20%);
  padding: 0 0 0 calc(1rem / 2);
  margin: 0;
}

/* .bvtable:not(.small) .table.b-table.b-table-stacked > tbody > tr > [data-label]::before {
  width: 35%;
  font-weight: normal;
} */
.small.table-responsive {
  max-height: 200px;
  overflow-y: auto;
}

.productproperties.table-responsive {
  min-height: 100vh;
  overflow-y: auto;
}
</style>
