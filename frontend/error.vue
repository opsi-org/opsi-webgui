<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <NuxtLayout :error="true">
    <div>
      <h1>{{ error?.statusCode }} {{ $t('message.error.general') }}</h1>
      <NuxtLink to="/">{{ $t('message.page.backToHome') }}</NuxtLink>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
  import type { NuxtError } from '#app'
  const $t = useI18n().t
  defineProps({
    error: {
      type: Object as () => NuxtError,
      default: () => ({ statusCode: 500, statusMessage: 'Unknown error' }),
    },
  })
</script>
