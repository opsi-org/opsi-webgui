<script lang="ts" setup>
import type { Story, Variant } from 'histoire'

const props = defineProps<{
  story: Story
  variant?: Variant
}>()

// onMounted(()=> {
//   if (props.variant)
//     props.variant.setupApp = ({}) => {
//       window.resizeTo(200,200)
//     }
// })
const hasWrapper = computed(()=> {
  return (props.story.meta as any)?.wrapperMobile === true ||
    (props.variant?.meta as any)?.wrapperMobile === true

})
// function hasWrapper () {
//   return (props.story.meta as any)?.wrapperMobile === true ||
//     (props.variant?.meta as any)?.wrapperMobile === true
// }
</script>

<template>
  <div
    class="global-wrapper"
    :class="hasWrapper ? 'mobile-wrapper' : 'no-mobile-wrapper'"
  >
    <slot />
  </div>
</template>

<style scoped>
.mobile-wrapper {
  --width-desktop: 370px; /** mobile width from tailwind */
  max-width: var(--width-desktop) !important;
  min-width: var(--width-desktop) !important;
  width: var(--width-desktop) !important;
  /* border: 1px solid blue; */
}
.no-mobile-wrapper {
  --width-desktop: 900px;
  max-width: var(--width-desktop) !important;
  min-width: var(--width-desktop) !important;
  width: var(--width-desktop) !important;
  /* border: 1px solid red; */
}
</style>