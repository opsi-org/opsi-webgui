<template>
  <div
    data-testid="TTooltip"
    @mouseenter="
      (ev: any) => (props.method == 'hover' ? popoverRef?.show(ev) : null)
    "
    @click="
      (ev: any) => (props.method == 'click' ? popoverRef?.toggle(ev) : null)
    "
    @mouseleave="
      (ev: any) =>
        props.method == 'hover' &&
        /* overwise the popover will be closed if mouse is over the popover (leaves this div) */
        ev.relatedTarget.className !== 'p-popover-content'
          ? popoverRef?.hide()
          : null
    "
  >
    <slot name="default" />

    <PPopover
      v-if="!disabled"
      ref="popoverRef"
      id="popover"
      class="mt-[-1px]"
      @mouseleave="
        (ev: any) => (props.method == 'hover' ? popoverRef?.hide() : null)
      "
    >
      <slot name="tooltip" />
    </PPopover>
  </div>
</template>

<script lang="ts" setup>
  const popoverRef = useTemplateRef<any>('popoverRef')
  type TMethod = 'hover' | 'click'
  const props = defineProps({
    disabled: { type: Boolean, default: false },
    method: { type: String as PropType<TMethod>, default: 'hover' },
  })
</script>
