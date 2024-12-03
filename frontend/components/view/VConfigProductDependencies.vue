<template>
  <div>
    <el-form
      v-for="item in props.dependencies.dependencies"
      :key="item.requiredProductId"
      label-width="50%"
      label-position="left"
    >
      <el-form-item>
        <template #label>
          {{ item.requiredProductId }}
        </template>
        <template #default>
          <b class="mr-1">{{ getValue(item) }}</b>
          {{ getType(item.requirementType, item.productAction) }}
        </template>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
  import type { IProductDependency } from '~/types/ttable'
  const $t = useI18n().t

  const props = defineProps({
    dependencies: { type: Object as PropType<any>, required: true },
  })

  const types2text: any = {
    'null-setup': $t('table.fields.required'),
    'after-setup': $t('table.fields.post-required'),
    'before-setup': $t('table.fields.pre-required'),
    'before-uninstall': $t('table.fields.on-deinstall') + '(not possible)',
  }

  const getValue = (rowItem: IProductDependency) => {
    const isAction = rowItem.requiredAction ? ':' : ''
    const isStatus = rowItem.requiredInstallationStatus ? ':' : ''
    const value = rowItem.requiredAction ?? rowItem.requiredInstallationStatus
    return isAction + value + isStatus
  }

  const getType = (type: string | null, productAction: string | null) => {
    return types2text[`${type}-${productAction}`] || $t('table.fields.unknown')
  }
</script>
