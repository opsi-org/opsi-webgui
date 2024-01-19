<template>
  <el-form>
    <el-form-item :label="$t('title.depots')">
      {{ selections.selectionDepots }}
    </el-form-item>
    <el-form-item :label="$t('title.clients')">
      {{ selections.selectionClients }}
    </el-form-item>
    <el-form-item :label="$t('title.products')">
      {{ selections.selectionProducts }}
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
const selections = storeSelections()
</script>
