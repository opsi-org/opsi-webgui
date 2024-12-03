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
      <ViewVConfig type="servers" :id="store.selectionDepots[0]" />
    </Variant>
    <!-- <Variant title="desktop" responsive-disabled>
      <ViewVConfig :isMobile="false"/>
    </Variant> -->
  </Story>
</template>
