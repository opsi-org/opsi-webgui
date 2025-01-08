<template>
  <div data-testid="IChangesTableFilter">
    <el-input
      v-model="modelFilter"
      :aria-label="placeholder"
      :placeholder="placeholder"
    >
      <template #prefix>
        <IconIIcon :icon="icons.filter" />
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
  const icons = useIcons()
  const modelFilter = defineModel<string>()
  const _props = defineProps<{
    placeholder: string
  }>()
</script>
