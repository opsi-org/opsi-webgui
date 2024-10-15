<template>
  <el-button
    :class="{
      'bg-opsi-blue': props.isPressed,
      'm-0': true,
    }"
    data-testid="BTNRowLink"
    @click.stop="emit('onClick')"
  >
    <iconIIcon :icon="props.icon" />
  </el-button>
</template>

<script setup lang="ts">
  import { useIcons } from '@/composables/mixins/useIcons'
  // const icons = useIcons()

  const emit = defineEmits(['onClick'])
  const props = defineProps({
    icon: { type: String, default: useIcons().settings },
    isPressed: { type: Boolean, default: false },
    link: { type: String, default: '' },
  })
</script>
