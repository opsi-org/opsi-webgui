<script setup lang="ts">
  import { loginlogout } from '~/histoire/histoire-utils'
  import { useConfigserver } from '~/composables/mixins/useGet'

  const store = ref<any>({ selectionDepots: [] })
  async function init(data: any) {
    await loginlogout(data)
    await useConfigserver(true, store)
  }
</script>
<template>
  <Story :setup-app="init">
    <Variant title="mobile" :meta="{ wrapperMobile: true }" responsive-disabled>
      <BarBTop />
    </Variant>
    <Variant title="desktop" responsive-disabled>
      <BarBTop />
    </Variant>
  </Story>
</template>
