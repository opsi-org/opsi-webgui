<template>
  <b-form-input v-bind="$props" placeholder="Filter table" alt="Filter" />
</template>

<script lang="ts">
import { Component } from 'nuxt-property-decorator'
import { BFormInput } from 'bootstrap-vue'
// import { ITableRow, ITableHeaders } from '~/types/tsettings'
// const selections = namespace('selections')

@Component
export default class IFilter extends BFormInput {
  // @Prop({ }) datakey!: string
}
</script>

<style>

</style>
