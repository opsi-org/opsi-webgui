<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
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
