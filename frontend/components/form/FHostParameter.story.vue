<script setup lang="ts">
  import { useConfigserver } from '~/composables/mixins/useGet'
  import { loginlogout } from '~/histoire/histoire-utils'

  const store = ref<any>({ selectionDepots: [] })
  async function init(data: any) {
    await loginlogout(data)
    await useConfigserver(true, store)
  }
</script>
<template>
  <Story :setup-app="init">
    <Variant title="mobile" :meta="{ wrapperMobile: true }" responsive-disabled>
      <FormFHostParameter :id="store.selectionDepots[0]" />
    </Variant>
    <Variant title="desktop" responsive-disabled>
      <FormFHostParameter :id="store.selectionDepots[0]" />
    </Variant>
    <!-- TODO: Add more Variants with (dummy) data -->
  </Story>
</template>
