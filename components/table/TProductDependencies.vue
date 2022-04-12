<template>
  <div data-testid="TProductDependencies">
    <TableTBVTable
      :is-loading="isLoading"
      :items="Object.values(dependencies.dependencies)"
      :fields="fields"
    >
      <template #empty>
        {{ $t('table.emptyText') }}
      </template>
      <template #head()="row">
        <b>{{ row.label }}</b>
      </template>
      <template #cell(requiredProductId)="row">
        <b>{{ row.item.requiredProductId }}</b>
      </template>
      <template #head(requiredProductId)>
        {{ }}
      </template>
      <template #cell(required)="row">
        {{ getValue(row.item) }}
      </template>
      <template #cell(type)="row">
        ({{ getType(row.item.requirementType, row.item.productAction) }})
      </template>
    </TableTBVTable>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { IObjectString2String } from '../../.utils/types/tgeneral'
import { IDepend, IProductDependency } from '../../.utils/types/ttable'

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
}
</script>
