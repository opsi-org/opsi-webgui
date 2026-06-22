<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  LayoutsTopbar - Main application topbar with logo, health check, messagebus status, and user menu.
-->
<template>
    <header class="bg-opsi-blue text-white h-12 flex items-center px-3 md:px-4 shadow-md shrink-0 z-50">
        <div class="flex items-center gap-2 md:gap-3">
            <CoreAppButton @click="$emit('toggle-sidebar')" variant="ghost" color="neutral"
                class="p-2! text-white hover:bg-white/20 active:bg-white/20! focus:bg-transparent!"
                :aria-label="$t('nav.sidebar')">
                <CoreAppIcon :name="icons.menu" class="w-5 h-5" />
            </CoreAppButton>
            <NuxtLink :to="defaultPage" class="flex items-center gap-2">
                <CoreAppImage src="~/assets/images/opsi-webgui-wide-dark.svg" alt="OPSI" image-class="h-10" />
            </NuxtLink>
        </div>
        <div class="flex-1" />
        <nav class="flex items-center gap-1 md:gap-1.5">
            <div v-if="formattedTime && formattedTime !== '0:00' && isWarning"
                class="h-7 px-2 inline-flex items-center justify-center gap-1 rounded-md text-xs bg-(--color-warning)/25 animate-pulse font-semibold"
                :title="$t('auth.expiresIn')">
                <CoreAppIcon :name="icons.clock" class="w-4 h-4" />
                <span class="font-medium tabular-nums">{{ formattedTime }}</span>
            </div>
            <NuxtLink v-if="healthWorstCase && healthWorstCase !== 'ok'" to="/admin/diagnostics"
                class="h-7 px-1.5 inline-flex items-center justify-center rounded-md hover:bg-white/20 transition-colors"
                :title="healthCheckTooltip">
                <CoreAppStatusBadge :status="healthWorstCase === 'error' ? 'error' : 'warning'"
                    :value="healthCounts?.error || healthCounts?.warning || 0" :icon="icons.health"
                    :tooltip="healthCheckTooltip" size="sm" variant="solid" />
            </NuxtLink>
            <CoreAppTooltip
                :text="messageBusStore.isConnected ? $t('bus.connected') : $t('bus.disconnected')">
                <div class="h-7 min-w-7 px-1.5 inline-flex items-center justify-center rounded-md hover:bg-white/20 transition-colors"
                    role="status"
                    :aria-label="messageBusStore.isConnected ? $t('bus.connected') : $t('bus.disconnected')">
                    <CoreAppMessageBusStatusIcon :connected="messageBusStore.isConnected" size="md" dark-bg />
                </div>
            </CoreAppTooltip>
            <CoreAppButton @click="$emit('toggle-quickpanel')" variant="ghost" color="neutral"
                class="h-7 px-2! text-white hover:bg-white/20 active:bg-white/20! focus:bg-transparent! inline-flex items-center gap-1.5 rounded-md"
                :title="$t('quick.panel')">
                <CoreAppIcon :name="icons.user" class="w-5 h-5" />
                <span class="hidden md:inline text-sm">{{ userStore.username }}</span>
                <CoreAppIcon :name="icons.quickPanel" class="w-4 h-4" />
            </CoreAppButton>
        </nav>
    </header>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/userStore'
import { useMessageBusStore } from '~/stores/messageBusStore'

defineProps<{
    defaultPage: string
    formattedTime: string | null
    isWarning: boolean
    healthCheckTooltip: string
    healthWorstCase: string
    healthCounts: Record<string, number>
}>()

defineEmits<{
    'toggle-sidebar': []
    'toggle-quickpanel': []
}>()

const icons = useIcons()
const userStore = useUserStore()
const messageBusStore = useMessageBusStore()
const { t: i18nT } = useI18n()

const $t = (key: string) => {
    const translated = i18nT(key)
    if (translated && translated !== key) return String(translated)
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}
</script>
