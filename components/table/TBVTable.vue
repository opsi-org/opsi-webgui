<template>
  <div data-testid="TBVTable">
    <p v-if="error">
      {{ error }}
    </p>
    <b-table
      v-else
      :class="type === 'small' ? 'bvtable_small' : 'bvtable'"
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
.table-header-none{
  display: none;
}

.bvtable .table.b-table.b-table-stacked > tbody > tr > [data-label]::before {
  width: 25%;
  font-weight: normal;
}
.bvtable_small{
  max-height: 200px;
  overflow-y: auto;
}

.bvtable {
  /* max-height: 64vh; */
  max-height: 610px;
  overflow-y: auto;
}
</style>
