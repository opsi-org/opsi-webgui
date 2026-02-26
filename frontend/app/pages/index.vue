<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <div class="min-h-screen flex items-center justify-center">
        <UIcon :name="icons.loading" class="w-8 h-8 text-opsi-blue animate-spin" />
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/userStore'

definePageMeta({ layout: false })

const icons = useIcons()
const userStore = useUserStore()

onMounted(async () => {
    // Check if user is logged in and redirect accordingly
    if (userStore.isAuthenticated) {
        await navigateTo('/clients')
    } else {
        await navigateTo('/login')
    }
})
</script>
