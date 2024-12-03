<script setup lang="ts">
  import { loginlogout } from '~/histoire/histoire-utils'
</script>

<!-- <template>
  <Story :setup-app="loginlogout">
    <ViewVServer />
  </Story>
</template> -->

<template>
  <Story :setup-app="loginlogout">
    <Variant title="mobile" :meta="{ wrapperMobile: true }" responsive-disabled>
      <ViewVServer :is-mobile="true" />
    </Variant>
    <Variant title="desktop" responsive-disabled>
      <ViewVServer :is-mobile="false" />
    </Variant>
  </Story>
</template>
