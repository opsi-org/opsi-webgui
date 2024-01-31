<template>
  <el-button
    :class="{pressed: props.isPressed}"
    data-testid="BTNRowLink"
    @click.stop="emit('onClick')"
  >
    <iconIIcon :icon="props.icon" />
  </el-button>
</template>

<script setup lang="ts">
import { useIcons } from '@/composables/mixins/useIcons'
const icon = useIcons()

const emit = defineEmits(['onClick'])
const props = defineProps({
  icon: { type: String, default: useIcons().settings },
  isPressed: { type: Boolean, default: false },
  link: { type: String, default: '' },
})



</script>
