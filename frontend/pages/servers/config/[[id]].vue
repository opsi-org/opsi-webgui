<template>
  <ViewVHostConfig :type="type" :is-child="false" :id="id" />
</template>

<script setup lang="ts">
  import { usePageHelper } from '~/composables/mixins/usePageHelper'
  import type { PropTypeServerClient } from '~/types/tproptypes'

  const type = computed(
    () => usePageHelper().path.value[0] as PropTypeServerClient,
  )
  const id = computed(() => (useRoute().params.id as string) || undefined)
  // const pagetype = computed(()=>useRoute().params.pagetype)
</script>
