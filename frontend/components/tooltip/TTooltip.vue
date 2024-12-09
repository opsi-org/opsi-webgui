<template>
  <div data-testid="TTooltip" @mouseenter="op?.toggle" @mouseleave="op?.toggle">
    <slot name="default" />

    <PPopover ref="op"> <slot name="tooltip" /> </PPopover>
  </div>
</template>

<script lang="ts" setup>
  const op = useTemplateRef<any>('op')
</script>
