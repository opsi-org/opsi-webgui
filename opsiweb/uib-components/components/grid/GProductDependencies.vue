<template>
  <b-container data-testid="GProductDependencies">
    <span v-for="item, index in dependencies.dependencies" :key="index">
      <GridGFormItem value-more="true" :value="getValue(item)" :valuedetails="getType(item.requirementType, item.productAction)" :labelclass="item">
        <template #label>
          <span class="font-weight-bold"> {{ item.requiredProductId }} </span>
          <span v-if="item.requiredVersion"> {{ item.requiredVersion }}</span>
        </template>
      </GridGFormItem>
    </span>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { IObjectString2String } from '../../.utils/types/tgeneral'
import { IDepend, IProductDependency } from '../../.utils/types/ttable'

@Component
export default class GProductProperties extends Vue {
  $t: any
  @Prop({ }) id!: string
  @Prop({ }) dependencies!: IDepend

  types2text: IObjectString2String = {}

  mounted () {
    this.types2text = {
      'null-setup': this.$t('table.fields.required') as string,
      'after-setup': this.$t('table.fields.post-required') as string,
      'before-setup': this.$t('table.fields.pre-required') as string,
      'before-uninstall': this.$t('table.fields.on-deinstall') as string + '(not possible)'
    }
  }

  getValue (rowItem: IProductDependency) {
    const isAction = (rowItem.requiredAction) ? ':' : ''
    const isStatus = (rowItem.requiredInstallationStatus) ? ':' : ''
    const value = rowItem.requiredAction ?? rowItem.requiredInstallationStatus
    return isAction + value + isStatus
  }

  getType (type:string|null, productAction:string|null) {
    return this.types2text[`${type}-${productAction}`] || this.$t('table.fields.unknown') as string
  }
}
</script>
