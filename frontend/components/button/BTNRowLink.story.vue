<!-- const props = defineProps({
  icon: { type: String, default: useIcons().settings },
  isPressed: { type: Boolean, default: false },
  link: { type: String, default: '' },
}) -->

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
  <!-- <Story :setup-app="init" > -->
  <Story :layout="{ type: 'grid' }">
    <Variant title="mobile" :meta="{ wrapperMobile: true }" responsive-disabled>
      <ButtonBTNRowLink />
    </Variant>
    <Variant title="desktop" responsive-disabled>
      <ButtonBTNRowLink />
    </Variant>
  </Story>
</template>
