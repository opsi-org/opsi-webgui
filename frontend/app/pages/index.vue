<!--
  This file is part of the OPSI-WebGUI application.
  OPSI-WebGUI is the web-based management interface for OPSI.
https://opsi.org/en/

  Copyright (c) UIB GmbH info@uib.de 2026
  All rights reserved.
  License: AGPL-3.0

  IndexPage - Root route redirect.
-->
<template>
  <div class="min-h-screen flex items-center justify-center">
    <CoreAppLoadingSpinner size="lg" />
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '~/stores/userStore'

  definePageMeta({ layout: false })

  const userStore = useUserStore()

  onMounted(async () => {
    if (userStore.isAuthenticated) {
      const defaultPage = getDefaultPageFromCookie()
      await navigateTo(defaultPage)
    } else {
      await navigateTo('/login')
    }
  })
</script>
