<template>
  <NuxtLayout :error="true">
    <div>
      <h1>{{ error?.statusCode }} {{ error?.statusMessage }}</h1>
      <NuxtLink to="/">{{ $t('message.error.back_to_home') }}</NuxtLink>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError
})

</script>
