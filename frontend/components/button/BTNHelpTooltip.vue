<template>
  <el-popover
    :placement="placement"
    :title="title"
    :width="width"
    :trigger="trigger as any"
    :content="content"
  >
    <template #reference>
      <el-button size="small" circle text :class="$attrs.class">
        <IconIIcon :icon="icons.help" />
      </el-button>
    </template>
  </el-popover>
</template>

<script setup lang="ts">
  import { useIcons } from '~/composables/mixins/useIcons'
  const icons = useIcons()

  const _props = defineProps({
    title: { type: String, default: undefined },
    content: { type: String, required: true },
    width: { type: Number, default: 200 },
    trigger: { type: String, default: 'hover' },
    placement: { type: String, default: 'top-start' },
  })
</script>
