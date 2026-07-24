<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  LayoutsTopbar - Main application topbar with logo, health check, messagebus status, and user menu.
-->
<template>
  <header
    class="bg-opsi-blue text-white h-12 flex items-center px-2.5 md:px-3 shadow-md shrink-0 z-50"
  >
    <div class="flex items-center gap-2 md:gap-3">
      <CoreAppButton
        @click="$emit('toggle-sidebar')"
        variant="ghost"
        color="neutral"
        class="p-1.5! text-white hover:bg-white/20 active:bg-white/20! focus:bg-transparent!"
        :aria-label="$t('nav.sidebar')"
      >
        <CoreAppIcon :name="icons.menu" class="w-5 h-5" />
      </CoreAppButton>
      <NuxtLink :to="defaultPage" class="flex items-center gap-1.5 min-w-0">
        <CoreAppImage
          src="~/assets/images/opsi-webgui-wide-dark.svg"
          alt="OPSI"
          image-class="h-13"
        />
        <span
          class="text-[9px] sm:text-[10px] leading-none opacity-80 self-center max-w-[5rem] truncate"
          :title="`v${packageVersion}`"
        >
          v{{ packageVersion }}
        </span>
      </NuxtLink>
    </div>
    <div class="flex-1" />
    <nav class="flex items-center gap-2 md:gap-3 px-2 py-1 rounded-lg">
      <div
        v-if="formattedTime && formattedTime !== '0:00' && isWarning"
        class="h-8 w-16 inline-flex items-center justify-center gap-1 rounded-md text-xs bg-yellow-500 text-black px-2 font-semibold hover:bg-yellow-500/30 transition-colors"
        :title="$t('auth.expiresIn')"
      >
        <CoreAppIcon :name="icons.clock" class="w-3.5 h-3.5" />
        <span class="font-medium tabular-nums">{{ formattedTime }}</span>
      </div>

      <div
        class="h-8 w-11 inline-flex items-center justify-center px-1.5 rounded-md bg-white/10 hover:bg-white/15 transition-colors"
        role="img"
        :aria-label="messageBusStore.isConnected ? $t('bus.connected') : $t('bus.disconnected')"
        :title="messageBusStore.isConnected ? $t('bus.connected') : $t('bus.disconnected')"
      >
        <CoreAppMessageBusStatusIcon :connected="messageBusStore.isConnected" dark-bg />
      </div>

      <NuxtLink
        v-if="healthWorstCase && healthWorstCase !== 'ok'"
        to="/admin/diagnostics"
        data-testid="health-badge"
        class="h-8 w-11 inline-flex items-center justify-center px-1.5 rounded-md bg-white/10 hover:bg-white/15 transition-colors"
        :aria-label="healthCheckTooltip"
        :title="healthCheckTooltip"
      >
        <CoreAppStatusBadge
          aria-hidden="true"
          :status="healthWorstCase === 'error' ? 'error' : 'warning'"
          :value="healthCounts?.error || healthCounts?.warning || 0"
          :icon="icons.health"
          size="sm"
          variant="solid"
        />
      </NuxtLink>

      <CoreAppButton
        @click="$emit('toggle-quickpanel')"
        variant="ghost"
        color="neutral"
        data-testid="quickpanel-toggle"
        class="h-8 text-white hover:bg-white/10 active:bg-white/10! focus:bg-transparent! inline-flex items-center gap-1.5 rounded-md"
        :title="$t('quick.panel')"
      >
        <CoreAppIcon :name="icons.user" class="w-5 h-5" />
        <span class="hidden md:inline text-sm">{{ userStore.username }}</span>
        <CoreAppIcon :name="icons.quickPanel" class="w-4.5 h-4.5" />
      </CoreAppButton>
    </nav>
  </header>
</template>

<script setup lang="ts">
  import { useUserStore } from '~/stores/userStore'
  import { useMessageBusStore } from '~/stores/messageBusStore'

  defineProps<{
    defaultPage: string
    packageVersion: string
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
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim()
  }
</script>
