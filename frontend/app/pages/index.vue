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
    if (userStore.isAuthenticated) {
        await navigateTo('/clients')
    } else {
        await navigateTo('/login')
    }
})
</script>
