<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppGlobalSearch - Topbar entry point for "Search -> Filter -> Save -> Favorite -> Reuse".
-->
<template>
  <CoreAppHoverPopover :title="String($t('globalSearch.title'))" content-class="min-w-96">
    <CoreAppButton
      :icon="icons.search"
      :aria-label="String($t('globalSearch.title'))"
      :title="String($t('globalSearch.title'))"
      variant="ghost"
      color="neutral"
      class="h-8 text-white hover:bg-white/10 active:bg-white/10! focus:bg-transparent!"
      data-testid="global-search"
    />

    <template #content>
      <div class="flex items-center gap-1.5">
        <div class="w-24 shrink-0">
          <CoreAppSelectMenu
            v-model="scope"
            :items="scopeOptions"
            open-on-hover
            no-caret
            size="sm"
            :aria-label="String($t('globalSearch.scope'))"
          />
        </div>
        <CoreAppFilterInput
          v-model="quickFilter"
          class="flex-1 min-w-0"
          input-class="w-full"
          :placeholder="String($t('globalSearch.quickSearchPlaceholder'))"
          @keydown.enter.prevent="runQuickSearch"
        />
        <CoreAppButton size="sm" color="primary" :icon="icons.search" @click="runQuickSearch" />
      </div>

      <div class="flex items-center justify-between gap-2">
        <p class="m-0 text-[0.6875rem] text-(--color-text-muted)">{{ $t('globalSearch.favorites') }}</p>
        <CoreAppButton v-if="favorites.length > 0" size="xs" variant="ghost" color="error" @click="clearAllFavorites">
          {{ $t('globalSearch.clearAllFavorites') }}
        </CoreAppButton>
      </div>

      <p v-if="favorites.length === 0" class="m-0 text-xs text-(--color-text-muted) italic">
        {{ $t('globalSearch.noFavorites') }}
      </p>
      <ul v-else class="m-0 p-0 list-none flex flex-col gap-0.5 max-h-64 overflow-y-auto">
        <li v-for="favorite in favorites" :key="`${favorite.scope}-${favorite.id}`" class="flex items-center gap-1">
          <button
            type="button"
            class="flex-1 min-w-0 flex items-center gap-2 rounded px-1.5 py-1 text-left text-sm bg-transparent border-0 cursor-pointer hover:bg-(--color-surface-hover)"
            @click="openFavorite(favorite)"
          >
            <CoreAppTooltip :text="String($t(`nav.${favorite.scope}`))">
              <CoreAppIcon
                :name="scopeIcon(favorite.scope)"
                i
                class="w-4 h-4 text-(--color-text-muted) shrink-0"
                :aria-label="String($t(`nav.${favorite.scope}`))"
              />
            </CoreAppTooltip>
            <span class="truncate flex-1">{{ favorite.name }}</span>
          </button>
          <CoreAppTooltip :text="String($t('globalSearch.removeFavorite'))">
            <CoreAppButton
              :icon="icons.xCircle"
              size="xs"
              variant="ghost"
              color="neutral"
              :aria-label="String($t('globalSearch.removeFavorite'))"
              @click="removeFavorite(favorite)"
            />
          </CoreAppTooltip>
        </li>
      </ul>
      <CoreAppButton variant="soft" color="error" size="xs" block :icon="icons.xCircle" @click="handleClearAllFilters">
        {{ $t('globalSearch.clearAllFilters') }}
      </CoreAppButton>
    </template>
  </CoreAppHoverPopover>
</template>

<script setup lang="ts">
  import {
    type GlobalFavorite,
    type GlobalSearchScope,
    scopeRoute,
    useGlobalFavorites,
    clearAllFilters,
  } from '~/composables/useGlobalFavorites'

  const icons = useIcons()
  const { t: $t } = useI18n()
  const router = useRouter()
  const { favorites, removeFavorite, clearAllFavorites } = useGlobalFavorites()

  const scope = ref<GlobalSearchScope>('clients')
  const quickFilter = ref('')

  const scopeOptions = computed(() => [
    { label: String($t('nav.clients')), value: 'clients' as const },
    { label: String($t('nav.products')), value: 'products' as const },
    { label: String($t('nav.servers')), value: 'servers' as const },
  ])

  function scopeIcon(scope: GlobalSearchScope) {
    return scope === 'clients' ? icons.client : scope === 'products' ? icons.product : icons.server
  }

  function runQuickSearch() {
    router.push({ path: scopeRoute(scope.value), query: quickFilter.value.trim() ? { filter: quickFilter.value.trim() } : {} })
  }

  function handleClearAllFilters() {
    quickFilter.value = ''
    clearAllFilters()
  }

  function openFavorite(favorite: GlobalFavorite) {
    router.push({ path: scopeRoute(favorite.scope), query: { filter: favorite.filterQuery || undefined, savedSearchId: favorite.id } })
  }
</script>
