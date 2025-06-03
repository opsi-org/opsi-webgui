<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <p-tree-table
    ref="healthtable"
    class="maintable-healthcheck"
    :value="data"
    :filters="filters"
    filter-mode="strict"
  >
    <p-column
      expander
      field="status"
      :header="$t('label.healthcheck.status')"
      :style="{
        'max-width: 80px; width: 80px; min-width: 80px': $mq === 'mobile',
        'max-width: 140px; width: 140px; min-width: 140px': $mq !== 'mobile',
      }"
      class="border-y align-text-top my-0 py-1"
    >
      <template #body="slotProps">
        <el-tag
          effect="dark"
          :type="getType(slotProps.node.data.status)"
          class="text-capitalize mx-2"
          >{{ slotProps.node.data.status }}</el-tag
        >
      </template>
    </p-column>

    <p-column
      field="name"
      :header="$t('label.healthcheck.check_name')"
      class="border-y align-text-top my-0 py-1"
    >
      <template #body="scope">
        <div class="block">
          <el-text v-if="!scope.node.data.description" tag="b" class="w-full">
            {{ scope.node.data.name }}</el-text
          >
          <TooltipTTooltip v-else>
            <el-text tag="b" class="w-full"> {{ scope.node.data.name }}</el-text>
            <template #tooltip>
              <el-text>
                {{ scope.node.data.description }}
              </el-text>
            </template>
          </TooltipTTooltip>

          <div
            v-if="$mq == 'mobile'"
            style="max-width: calc(100vw - 110px); width: calc(100vw - 110px)"
          >
            <el-text>
              {{ scope.node.data.message }}
            </el-text>
          </div>
        </div>
      </template>
    </p-column>

    <p-column
      v-if="$mq !== 'mobile'"
      min-width="200"
      field="message"
      :header="$t('label.healthcheck.check_message')"
      class="border-y align-text-top my-0 py-1"
    />
  </p-tree-table>
</template>

<script setup lang="ts">
  import { TooltipTTooltip } from '#components'

  const $t = useI18n().t
  const $mq = useMQ().$mq
  const modelValue = defineModel<Array<any>>()
  const _props = defineProps({
    withColumnHeaders: { type: Boolean, default: true },
    filter: { type: String, default: '' },
  })
  const healthtable = ref()
  const filters = ref<Record<string, any>>({ global: _props.filter })
  watch(
    () => _props.filter,
    (newVal) => (filters.value.global = newVal)
  )

  function transformThisLevel(arrdata: Array<any>): Array<any> {
    return (arrdata || []).map((item: any) => {
      if (!item) {
        console.warn('item is empty')
        return
      }
      const item2 = {
        status: item.check?.status || item.check_status || '?',
        key: item.check?.id || item.check_id || '',
        name: item.check?.name || item.check_name || '',
        description: item.check?.description || item.check_description || '',
        // (parent.length > 0 ? cid.replace(`${parent}`, '') : cid),
        message: item.message,
        details: item.details,
      }
      return item.partial_results && item.partial_results.length <= 0
        ? {
            // item
            key: item2.key,
            label: item2.name,
            data: { ...item2 },
          }
        : {
            // group
            key: item2.key,
            label: item2.name,
            data: { ...item2 },
            children: transformThisLevel(item.partial_results),
          }
    })
  }

  const data = computed(() => {
    if (modelValue.value) {
      const res = transformThisLevel(modelValue.value)
      return res
    }

    return undefined
  })

  function getType(status: any) {
    if (status === 'error') {
      return 'danger'
    } else if (status === 'ok') {
      return 'success'
    } else if (status === 'warning') {
      return 'warning'
    } else {
      return 'primary'
    }
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
