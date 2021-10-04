<template>
  <div>
    <TableTTable
      v-if="dependencies.dependencies"
      :is-busy="isLoading"
      :stacked="false"
      :small="true"
      :disable-selection="true"
      :items="Object.values(dependencies.dependencies)"
      :fields="fields"
      :value-is-input-field="false"
    >
      <template #empty>
        <small>{{ $t('table.emptyText') }}</small>
      </template>
      <template #head()="row">
        <small><b>{{ row.label }}</b></small>
      </template>
      <template #cell(requiredProductId)="row">
        <small><b>{{ row.item.requiredProductId }}</b></small>
      </template>
      <template #head(requiredProductId)>
        <small>{{ }}</small>
      </template>
      <template #cell(required)="row">
        <small>
          {{ getValue(row.item) }}
        </small>
      </template>
      <template #cell(type)="row">
        <small>
          ({{ getType(row.item.requirementType, row.item.productAction) }})
        </small>
      </template>
    </TableTTable>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { IObjectString2String } from '~/types/tsettings'
import { IDepend, IProductDependency } from '~/types/ttable'

@Component
export default class TProductProperties extends Vue {
  @Prop({ }) id!: string
  @Prop({ }) dependencies!: IDepend

  isLoading: boolean = false
  types2text: IObjectString2String = {
    'null-setup': this.$t('table.fields.required') as string,
    'after-setup': this.$t('table.fields.post-required') as string,
    'before-setup': this.$t('table.fields.pre-required') as string,
    'before-uninstall': this.$t('table.fields.on-deinstall') as string + '(not possible)'
  }

  get fields () {
    return [
      // { label: this.$t('table.fields.productId'), key: 'productId' },
      { label: this.$t('table.fields.productId'), key: 'requiredProductId' },
      { label: this.$t('table.fields.required'), key: 'required' },
      { label: this.$t('table.fields.requiredType'), key: 'type' }
      // { label: this.$t('table.fields.pre-required'), key: 'pre-required' },
      // { label: this.$t('table.fields.post-required'), key: 'post-required' },
      // { label: this.$t('table.fields.on-deinstall'), key: 'on deinstall' }
    ]
  }

  getValue (rowItem: IProductDependency) {
    const isAction = (rowItem.requiredAction) ? ':' : ''
    const isStatus = (rowItem.requiredInstallationStatus) ? ':' : ''
    const value = rowItem.requiredAction || rowItem.requiredInstallationStatus
    return isAction + value + isStatus
  }

  getType (type:string, productAction:string) {
    return this.types2text[`${type}-${productAction}`] || this.$t('table.fields.unknown') as string
  }

  // async fetch () {

  // }
}
</script>

<style>

</style>
