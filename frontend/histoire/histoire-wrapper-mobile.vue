<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
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
  const hasWrapper = computed(() => {
    return (
      (props.story.meta as any)?.wrapperMobile === true ||
      (props.variant?.meta as any)?.wrapperMobile === true
    )
  })
  // function hasWrapper () {
  //   return (props.story.meta as any)?.wrapperMobile === true ||
  //     (props.variant?.meta as any)?.wrapperMobile === true
  // }
</script>

<template>
  <div class="global-wrapper" :class="hasWrapper ? 'mobile-wrapper' : 'no-mobile-wrapper'">
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
