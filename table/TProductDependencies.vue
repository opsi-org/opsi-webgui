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
      { label: this.$t('table.fields.productId'), key: 'productId' },
      { label: this.$t('table.fields.required'), key: 'required' },
      { label: this.$t('table.fields.pre-required'), key: 'pre-required' },
      { label: this.$t('table.fields.post-required'), key: 'post-required' },
      { label: this.$t('table.fields.on-deinstall'), key: 'on deinstall' }
    ]
  }
}
</script>

<style>

</style>
