<template>
  <div data-testid="TTooltip" @mouseenter="op?.toggle" @mouseleave="op?.toggle">
    <slot name="default" />

    <PPopover v-if="!disabled" ref="op"> <slot name="tooltip" /> </PPopover>
  </div>
</template>

<script lang="ts" setup>
  const op = useTemplateRef<any>('op')

  const _props = defineProps({
    disabled: { type: Boolean, default: false },
  })
</script>
