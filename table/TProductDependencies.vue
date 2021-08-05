<template>
  <div>
    <TableTDefault
      v-if="dependencies"
      :is-busy="isLoading"
      :stacked="false"
      :small="true"
      :tableitems="Object.values(dependencies)"
      :tablefields="fields"
      :value-is-input-field="false"
    >
      <template #head()="row">
        <small><b>{{ row.label }}</b></small>
      </template>

      <template #cell()="row">
        <small>{{ row.item[row.field.key] }}</small>
      </template>
    </TableTDefault>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { IProductDependency } from '~/types/ttable'

@Component
export default class TProductProperties extends Vue {
  @Prop({ }) id!: string
  @Prop({ }) dependencies!: Array<IProductDependency>

  isLoading: boolean = false
  get fields () {
    return [
      { label: 'product', key: 'productId' },
      { label: 'required', key: 'required' },
      { label: 'pre-required', key: 'pre-required' },
      { label: 'post-required', key: 'post-required' },
      { label: 'on deinstall', key: 'on deinstall' }
    ]
  }
}
</script>

<style>

</style>
