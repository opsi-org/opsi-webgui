<template>
  <el-table :data="data.health_check" row-key="check_id" :tree-props="{ children: 'partial_results' }">
    <el-table-column
      prop="check_status"
      label="Status"
      width="150"
      :filters="[
      { text: 'Ok', value: 'ok' },
      { text: 'Error', value: 'error' },
      { text: 'Warning', value: 'warning' },
    ]"
    :filter-method="filterStatus"
  >
      <template #default="scope">
        <el-button :type="getType(scope.row.check_status)" class="text-capitalize" size="small">{{ scope.row.check_status }}</el-button>
      </template>
    </el-table-column>
    <el-table-column prop="check_name" label="Check Name" width="450" />
    <el-table-column prop="message" label="Message" />
  </el-table>
</template>

<script setup lang="ts">
const props = defineProps({
  data: { type: Object, required: true }
})
const filterStatus = (value: string, row: any) => {
  return row.check_status === value
}

function getType (status: any) {
  if (status === 'error') { return 'danger' } else if (status === 'ok') { return 'success' } else if (status === 'warning') { return 'warning' } else { return 'primary' }
}
</script>
