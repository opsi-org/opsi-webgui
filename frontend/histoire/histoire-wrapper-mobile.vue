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
}
.no-mobile-wrapper {
  min-width: 800px;
}
</style>