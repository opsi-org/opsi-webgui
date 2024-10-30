<template>
  <el-table
    ref="healthtable"
    lazy
    class="maintable-healthcheck"
    row-key="name"
    :data="data"
    :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
  >
    <!-- row-class-name="maintable__row" -->
    <el-table-column prop="expand" width="50" >
      <template #default="scope">
        <a
          v-if="scope.row.children"
          :aria-expanded="false" aria-controls="details-row-1"
          :aria-label="$t('button.expand.arialabel')"
          :title="$t('button.expand.arialabel')"
          @click="() => {
            scope.row.expanded = !scope.row.expanded;
            healthtable.toggleRowExpansion(scope.row, scope.row.expanded);
            healthtable.doLayout();
          }"
        >
          <IconIIcon v-if="scope.row.expanded" :icon="icons.arrowDown" />
          <IconIIcon v-else :icon="icons.arrowRight" />
        </a>
      </template>
    </el-table-column>

    <el-table-column
      prop="status"
      :label="$t('label.healthcheck.status')"
      width="150"
      filter-icon="el-icon-filter"
      :filters="[
        { text: 'Ok', value: 'ok' },
        { text: 'Error', value: 'error' },
        { text: 'Warning', value: 'warning' },
      ]"
      :filter-method="filterStatus"
    >
      <template #default="scope">
      <el-tag effect="dark" :type="getType(scope.row.status)" class="text-capitalize">{{ scope.row.status }}</el-tag>
      </template>
    </el-table-column>

    <el-table-column prop="name" :label="$t('label.healthcheck.check_name')" width="450" >
      <template #default="scope">
        <el-text> {{ scope.row.name }}</el-text>
      </template>
    </el-table-column>

    <el-table-column prop="message" :label="$t('label.healthcheck.check_message')" />
  </el-table>
</template>

<script setup lang="ts">
import { useIcons } from '~/composables/mixins/useIcons';

const icons = useIcons()
const $t = useI18n().t
const modelValue = defineModel<Array<any>>()
  const _props = defineProps({
    withColumnHeaders: { type: Boolean, default: true },
  })
const healthtable = ref()

function transformThisLevel (arrdata: Array<any>): Array<any> {
  return arrdata.map((item: any) => {
    const {partial_results, ..._ } = item
    const item2 = {
      name: item.check.id,
      status: item.check_status,
      message: item.message,
      details: item.details,
      expanded: false
    }
    return (item.partial_results && item.partial_results.length > 0) ?
      { ...item2, children: transformThisLevel(partial_results), hasChildren: true } :
      item2
  })
}

const data = computed(() => {
  if (modelValue.value)
    return transformThisLevel(modelValue.value)

  return undefined
})

const filterStatus = (value: string, row: any) => {
  return row.check_status === value
}

function getType (status: any) {
  if (status === 'error') { return 'danger' }
  else if (status === 'ok') { return 'success' }
  else if (status === 'warning') { return 'warning' }
  else { return 'primary' }
}
</script>

<style scoped>
:deep(.el-table__expand-icon) {
  display: none !important;
}

:deep(.el-table__row--level-1 > .el-table__cell) {
  padding: 0 !important;
}

:deep(.el-table__row--level-1) {
  .el-table__cell.el-table_1_column_2,
  .el-table__cell.el-table_1_column_3 {
    padding-left: 20px !important;
  }
}
</style>