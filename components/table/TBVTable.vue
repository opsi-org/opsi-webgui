<template>
  <div data-testid="TBVTable">
    <p v-if="error">
      {{ error }}
    </p>
    <b-table
      v-else
      class="bvtable"
      v-bind="$props"
      small
      :items="items"
      :fields="fields"
      :stacked="stacked"
      sticky-header
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
  @Prop({ }) error!: string
  @Prop({ }) isLoading!: boolean
  @Prop({ }) stacked!: boolean
  @Prop({ }) items!: Array<object>
  @Prop({ }) fields!: Array<object>
}
</script>

<style>
.bvtable .table.b-table.b-table-stacked > tbody > tr > [data-label]::before {
  width: 15%;
  /* float: left; */
  text-align: right;
}
</style>
