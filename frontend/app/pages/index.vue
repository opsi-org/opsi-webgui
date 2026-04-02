<template>
    <div class="min-h-screen flex items-center justify-center">
        <UIcon :name="icons.refresh" class="w-8 h-8 text-opsi-blue animate-spin" />
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/userStore'

definePageMeta({ layout: false })

const icons = useIcons()
const userStore = useUserStore()

onMounted(async () => {
    if (userStore.isAuthenticated) {
        const defaultPage = getDefaultPage()
        await navigateTo(defaultPage)
    } else {
        await navigateTo('/login')
    }
})

function getDefaultPage(): string {
    const match = document.cookie.match(/(?:^|; )opsi-webgui-default-page=([^;]*)/)
    const stored = match?.[1] ? decodeURIComponent(match[1]) : null
    const validPages = ['/dashboard', '/clients', '/products', '/servers', '/admin/terminal', '/admin/maintenance', '/admin/diagnostics']
    if (stored && validPages.includes(stored)) return stored
    return '/clients'
}
</script>
