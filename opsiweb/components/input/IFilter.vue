<template>
  <b-form-input
    v-model="data.filterQuery"
    v-bind="$props"
    placeholder="Filter table"
    aria-label="Filter"
  />
</template>

<script lang="ts">
import { Component, Prop } from 'nuxt-property-decorator'
import { BFormInput } from 'bootstrap-vue'
// import { ITableRow, ITableHeaders } from '~/types/tsettings'
// const selections = namespace('selections')

@Component
export default class IFilter extends BFormInput {
  @Prop({ }) data!: string
}
</script>

<style>

</style>
