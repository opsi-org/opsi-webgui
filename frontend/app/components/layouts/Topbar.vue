<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  LayoutsTopbar - Main application topbar with logo, health check, messagebus status, and user menu.
-->
<template>
    <header class="bg-opsi-blue text-white h-14 flex items-center px-3 md:px-4 shadow-md shrink-0 z-50">
        <div class="flex items-center gap-2 md:gap-3">
            <CoreAppButton @click="$emit('toggle-sidebar')" variant="ghost" color="neutral"
                class="p-2! text-white hover:bg-white/20 active:bg-white/20! focus:bg-transparent!"
                :aria-label="$t('nav.sidebar')">
                <CoreAppIcon :name="icons.menu" class="w-6 h-6" />
            </CoreAppButton>
            <NuxtLink :to="defaultPage" class="flex items-center gap-2">
                <CoreAppImage src="~/assets/images/opsi-webgui-wide-dark.svg" alt="OPSI" image-class="h-13" />
            </NuxtLink>
        </div>
        <div class="flex-1" />
        <nav class="flex items-center gap-2 md:gap-3 px-2 py-1 rounded-lg">
            <div v-if="formattedTime && formattedTime !== '0:00' && isWarning"
                class="h-9 w-13 inline-flex items-center justify-center gap-1.5 rounded-md text-xs bg-yellow-500/20 text-yellow-100 px-2.5 font-semibold border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors"
                :title="$t('auth.expiresIn')">
                <CoreAppIcon :name="icons.clock" class="w-4 h-4" />
                <span class="font-medium tabular-nums">{{ formattedTime }}</span>
            </div>

            <div class="h-9 w-13 inline-flex items-center justify-center px-2 rounded-md bg-white/10 hover:bg-white/15 transition-colors"
                role="img" :aria-label="messageBusStore.isConnected ? $t('bus.connected') : $t('bus.disconnected')"
                :title="messageBusStore.isConnected ? $t('bus.connected') : $t('bus.disconnected')">
                <CoreAppMessageBusStatusIcon :connected="messageBusStore.isConnected" dark-bg />
            </div>

            <NuxtLink v-if="healthWorstCase && healthWorstCase !== 'ok'" to="/admin/diagnostics"
                data-testid="health-badge"
                class="h-9 w-13 inline-flex items-center justify-center px-2 rounded-md bg-white/10 hover:bg-white/15 transition-colors"
                :aria-label="healthCheckTooltip" :title="healthCheckTooltip">
                <CoreAppStatusBadge aria-hidden="true" :status="healthWorstCase === 'error' ? 'error' : 'warning'"
                    :value="healthCounts?.error || healthCounts?.warning || 0" :icon="icons.health" size="sm"
                    variant="solid" />
            </NuxtLink>

            <CoreAppButton @click="$emit('toggle-quickpanel')" variant="ghost" color="neutral"
                data-testid="quickpanel-toggle"
                class="h-10 text-white hover:bg-white/10 active:bg-white/10! focus:bg-transparent! inline-flex items-center gap-2 rounded-md"
                :title="$t('quick.panel')">
                <CoreAppIcon :name="icons.user" class="w-6 h-6" />
                <span class="hidden md:inline text-base">{{ userStore.username }}</span>
                <CoreAppIcon :name="icons.quickPanel" class="w-5 h-5" />
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
