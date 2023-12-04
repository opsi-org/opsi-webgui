<script lang="ts" setup>
import type { Story, Variant } from 'histoire'

const props = defineProps<{
  story: Story
  variant?: Variant
}>()

onMounted(()=> {
  if (props.variant)
    props.variant.setupApp = ({}) => {
      window.resizeTo(200,200)
    }
  // window.resizeTo(200, 300);
  // if (hasWrapper()) {
  // }
})

function hasWrapper () {
  return (props.story.meta as any)?.wrapperMobile === true ||
    (props.variant?.meta as any)?.wrapperMobile === true
}
</script>

<template>
  <div
    class="global-wrapper"
    :class="hasWrapper() ? 'mobile-wrapper' : 'no-mobile-wrapper'"
  >
    <slot />
  </div>
</template>

<style scoped>
.mobile-wrapper {
  max-width: 600px; /** mobile width from tailwind */
  /* width: 500px; */
  border: 1px solid red;
  overflow: hidden;
  container: 200;
}
</style>