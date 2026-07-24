<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  DefaultLayout - Main application layout with sidebar, topbar, breadcrumb, and quickpanel.
-->
<template>
  <div class="h-screen w-screen flex flex-col overflow-hidden">
    <a href="#main-content" class="sr-skip-link">{{ $t('common.skipToContent') }}</a>
    <LayoutsTopbar
      :default-page="defaultPage"
      :package-version="runtimeConfig.public.packageVersion || '1.0.0'"
      :formatted-time="formattedTime"
      :is-warning="isWarning"
      :health-check-tooltip="healthCheckTooltip"
      :health-worst-case="currentHealthWorstCase"
      :health-counts="currentHealthCounts"
      @toggle-sidebar="toggleSidebar"
      @toggle-quickpanel="toggleQuickpanel"
    />

    <div class="flex-1 flex overflow-hidden relative">
      <div
        v-if="isMobile && sidebarOpen"
        class="absolute inset-0 bg-black/50 z-30"
        role="button"
        tabindex="0"
        :aria-label="String($t('common.close'))"
        @click="sidebarOpen = false"
        @keydown.enter="sidebarOpen = false"
        @keydown.space.prevent="sidebarOpen = false"
      />

      <aside
        aria-label="Navigation"
        :class="[
          'shrink-0 transition-all duration-200 z-40',
          isMobile
            ? sidebarOpen
              ? 'absolute left-0 top-0 h-full w-64 shadow-lg'
              : 'absolute -left-64 top-0 h-full w-64'
            : sidebarOpen
              ? 'w-46'
              : 'w-12',
        ]"
      >
        <LayoutsSidebar :collapsed="!sidebarOpen && !isMobile" :is-mobile="isMobile" />
      </aside>

      <main class="flex-1 flex flex-col overflow-hidden bg-(--color-surface)">
        <LayoutsBreadCrumb />
        <div class="shrink-0 z-10 px-2 md:px-2.5">
          <Transition name="slide-down">
            <CoreAppAlertInline
              v-if="userStore.globalError"
              color="error"
              :title="$t('common.error')"
              :description="userStore.globalError"
              closable
              compact
              class="mt-2"
              @close="userStore.globalError = undefined"
            />
          </Transition>
          <Transition name="slide-down">
            <CoreAppAlertInline
              v-if="userStore.readOnly"
              color="warning"
              :title="$t('common.readOnly')"
              variant="subtle"
              compact
              class="mt-2"
            />
          </Transition>
          <Transition name="slide-down">
            <CoreAppAlertInline
              v-if="messageBusStore.certWarning"
              color="warning"
              variant="subtle"
              compact
              class="mt-2"
              closable
              @close="messageBusStore.certWarning = false"
            >
              <template #description>
                <span
                  >{{ $t('bus.certWarning') }}
                  <a
                    :href="messageBusStore.certWarningUrl"
                    target="_blank"
                    rel="noopener"
                    class="underline font-medium hover:text-(--color-text-highlighted)"
                  >
                    {{ $t('bus.acceptCert') }}
                  </a>
                </span>
              </template>
            </CoreAppAlertInline>
          </Transition>
          <Transition name="slide-down">
            <CoreAppAlertInline
              v-if="messageBusStore.changesDetected && !messageBusStore.autoRefresh"
              color="warning"
              variant="subtle"
              compact
              class="mt-2"
            >
              <template #description>
                <span class="inline-flex items-center gap-2">
                  <span
                    >{{ $t('bus.changes') }}:
                    <strong>{{
                      messageBusStore.lastEventType?.replace('event:', '') || $t('common.activity')
                    }}</strong></span
                  >
                  <CoreAppButton size="xs" color="warning" variant="soft" @click="$router.go(0)">
                    <CoreAppIcon :name="icons.refresh" class="w-3.5 h-3.5 mr-1" />
                    {{ $t('common.refresh') }}
                  </CoreAppButton>
                  <CoreAppButton
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    @click="messageBusStore.setChangesDetected(false)"
                  >
                    <CoreAppIcon :name="icons.x" class="w-3.5 h-3.5" />
                  </CoreAppButton>
                </span>
              </template>
            </CoreAppAlertInline>
          </Transition>
        </div>
        <div id="main-content" class="flex-1 p-2 md:p-2.5 overflow-hidden min-h-0">
          <slot />
        </div>
      </main>

      <Transition name="quickpanel-slide">
        <aside
          v-if="quickpanelOpen && !useOverlayQuickpanel"
          :style="{ width: quickpanelWidth + 'px' }"
          data-testid="quickpanel"
          class="bg-(--color-background) border-l border-(--color-border) overflow-hidden shrink-0 flex flex-col relative"
        >
          <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- pointer-only drag resize handle; not keyboard operable by design -->
          <div
            class="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-opsi-blue/30 active:bg-opsi-blue/50 transition-colors z-10 group flex items-center justify-center"
            @mousedown="startQuickpanelResize"
          >
            <div
              class="w-0.5 h-8 bg-(--color-border) rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <div class="p-2.5 flex-1 min-h-0 flex flex-col overflow-hidden">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-(--color-text)">{{ $t('quick.panel') }}</span>
              <CoreAppButton
                @click="quickpanelOpen = false"
                variant="ghost"
                color="neutral"
                :aria-label="String($t('common.close'))"
                class="p-1! hover:bg-(--color-surface-hover)"
              >
                <CoreAppIcon :name="icons.x" class="w-4 h-4" />
              </CoreAppButton>
            </div>
            <div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
              <QuickpanelMainView />
            </div>
          </div>
        </aside>
      </Transition>
    </div>

    <Transition name="slide-up">
      <div v-if="quickpanelOpen && useOverlayQuickpanel" class="fixed inset-0 z-50">
        <div
          class="absolute inset-0 bg-black/50"
          role="button"
          tabindex="0"
          :aria-label="String($t('common.close'))"
          @click="quickpanelOpen = false"
          @keydown.enter="quickpanelOpen = false"
          @keydown.space.prevent="quickpanelOpen = false"
        />
        <div class="absolute inset-0 bg-(--color-background) overflow-hidden">
          <div class="p-2.5 h-full min-h-0 flex flex-col overflow-hidden">
            <div class="flex justify-center mb-3">
              <div class="w-10 h-1 bg-(--color-border) rounded-full" />
            </div>

            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-(--color-text)">{{ $t('quick.panel') }}</span>
              <CoreAppButton
                :icon="icons.x"
                size="sm"
                variant="ghost"
                color="neutral"
                :aria-label="String($t('common.close'))"
                class="rounded-full"
                @click="quickpanelOpen = false"
              />
            </div>

            <div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
              <QuickpanelMainView />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { useUiStore } from '~/stores/uiStore'
  import { useUserStore } from '~/stores/userStore'
  import { useMessageBusStore } from '~/stores/messageBusStore'
  import { useSessionTimer } from '~/composables/useSessionTimer'

  const icons = useIcons()
  const runtimeConfig = useRuntimeConfig()
  const userStore = useUserStore()
  const uiStore = useUiStore()
  const messageBusStore = useMessageBusStore()
  const { healthCounts: cachedHealthCounts, diagnosticsFetched } = useCachedData()

  const { isWarning, formattedTime } = useSessionTimer(true)
  const $route = useRoute()
  const { t: i18nT } = useI18n()

  const defaultPage = ref('/clients')

  const healthCheckTooltip = computed(() => {
    const counts = diagnosticsFetched.value ? cachedHealthCounts.value : userStore.healthCounts
    if (!counts) return $t('diag.health')
    const parts: string[] = []
    if (counts.error) parts.push(`${counts.error} ${$t('common.errors')}`)
    if (counts.warning) parts.push(`${counts.warning} ${$t('common.warnings')}`)
    return parts.length > 0 ? `${$t('diag.health')}: ${parts.join(', ')}` : $t('diag.health')
  })

  const currentHealthCounts = computed(() => {
    return diagnosticsFetched.value ? cachedHealthCounts.value : userStore.healthCounts
  })

  const currentHealthWorstCase = computed(() => {
    if (diagnosticsFetched.value) {
      const counts = cachedHealthCounts.value
      if (counts.error > 0) return 'error'
      if (counts.warning > 0) return 'warning'
      return 'ok'
    }
    return userStore.healthWorstCase
  })

  function updateDefaultPage() {
    defaultPage.value = getDefaultPageFromCookie()
  }

  const $t = (key: string) => {
    const translated = i18nT(key)
    if (translated && translated !== key) return String(translated)
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim()
  }

  const isMobile = ref(false)
  const isNarrowDesktop = ref(false)
  const sidebarOpen = ref(false)
  const quickpanelOpen = ref(false)

  const DEFAULT_QUICKPANEL_WIDTH = 264
  const MIN_QUICKPANEL_WIDTH = 220
  const quickpanelWidth = ref(DEFAULT_QUICKPANEL_WIDTH)
  const isResizingQuickpanel = ref(false)
  const useOverlayQuickpanel = computed(() => isMobile.value || isNarrowDesktop.value)

  function startQuickpanelResize(e: MouseEvent) {
    e.preventDefault()
    isResizingQuickpanel.value = true
    const startX = e.clientX
    const startWidth = quickpanelWidth.value

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = startX - moveEvent.clientX
      const maxWidth = window.innerWidth * 0.5
      const newWidth = Math.min(Math.max(startWidth + deltaX, MIN_QUICKPANEL_WIDTH), maxWidth)
      quickpanelWidth.value = newWidth
    }

    const onMouseUp = () => {
      isResizingQuickpanel.value = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  onMounted(() => {
    updateDefaultPage()
    messageBusStore.connect()
    const checkMobile = () => {
      isMobile.value = window.innerWidth < 768
      uiStore.setIsMobile(isMobile.value)
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('mobile-view', isMobile.value)
        if (isMobile.value) document.documentElement.setAttribute('data-mobile-view', 'true')
        else document.documentElement.removeAttribute('data-mobile-view')
      }
      isNarrowDesktop.value = window.innerWidth < 1280
      if (!isMobile.value) {
        sidebarOpen.value = !uiStore.menuCollapsed
        quickpanelOpen.value = uiStore.quickpanelOpened
      } else {
        sidebarOpen.value = false
        quickpanelOpen.value = false
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    onUnmounted(() => window.removeEventListener('resize', checkMobile))
  })

  watch(
    () => $route.path,
    () => {
      if (isMobile.value) {
        sidebarOpen.value = false
      }
      updateDefaultPage()
    }
  )

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
    if (!isMobile.value) {
      uiStore.menuCollapsed = !sidebarOpen.value
    }
  }

  function toggleQuickpanel() {
    quickpanelOpen.value = !quickpanelOpen.value
    if (!isMobile.value) {
      uiStore.quickpanelOpened = quickpanelOpen.value
    }
    updateDefaultPage()
  }
</script>

<style scoped>
  .quickpanel-slide-enter-active {
    transition:
      transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.2s ease;
  }

  .quickpanel-slide-leave-active {
    transition:
      transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.15s ease;
  }

  .quickpanel-slide-enter-from {
    transform: translateX(100%);
    opacity: 0;
  }

  .quickpanel-slide-leave-to {
    transform: translateX(100%);
    opacity: 0;
  }

  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: all 0.3s ease;
  }

  .slide-up-enter-from,
  .slide-up-leave-to {
    opacity: 0;
  }

  .slide-up-enter-from > div:last-child,
  .slide-up-leave-to > div:last-child {
    transform: translateY(100%);
  }

  .slide-up-enter-to > div:last-child,
  .slide-up-leave-from > div:last-child {
    transform: translateY(0);
  }

  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: all 0.2s ease;
  }

  .slide-down-enter-from,
  .slide-down-leave-to {
    opacity: 0;
    transform: translateY(-8px);
  }
</style>
