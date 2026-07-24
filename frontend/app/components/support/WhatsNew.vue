<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  SupportWhatsNew - Release notes display.
-->
<template>
  <CoreAppCard class="h-full flex flex-col">
    <template #header>
      <CoreAppHeading :icon="icons.whatsNew" :text="$t('support.whatsNew')" />
    </template>

    <div v-if="loading" class="flex justify-center py-4">
      <CoreAppLoadingSpinner />
    </div>

    <div v-else-if="error" class="text-sm text-[--color-text-muted]">
      {{ $t('products.changelog.none') }}
    </div>
    <div v-else class="space-y-2 flex-1 overflow-y-auto">
      <div
        v-for="(item, idx) in items"
        :key="idx"
        class="changelog-item flex items-start gap-2 text-sm pb-2"
      >
        <CoreAppIcon :name="icons.minus" class="h-5 w-2" />
        <span>{{ item.text }}</span>
      </div>
    </div>

    <template v-if="!loading && !error && items.length" #footer>
      <div class="text-xs text-[--color-text-muted]">{{ $t('common.version') }}: {{ version }}</div>
    </template>
  </CoreAppCard>
</template>

<script setup lang="ts">
  const icons = useIcons()
  const { t: $t } = useI18n()
  const config = useRuntimeConfig()
  const { changelogs: cachedChangelogs, changelogsLoading, fetchChangelogs } = useCachedData()

  const error = ref(false)
  const items = ref<{ section: string; text: string }[]>([])

  const loading = changelogsLoading
  const version = computed(() => config.public.packageVersion || '-')

  function parseChangelog(markdown: string): { section: string; text: string }[] {
    const lines = markdown.split('\n')
    const parsedItems: { section: string; text: string }[] = []
    let currentSection = ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      if (trimmed.startsWith('### ')) {
        currentSection = trimmed.replace(/^###\s+/, '').trim()
        continue
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        parsedItems.push({ section: currentSection, text: trimmed.substring(2).trim() })
      }
    }
    return parsedItems
  }

  async function fetchChangelog() {
    error.value = false
    try {
      const data = await fetchChangelogs()
      if (!data) {
        throw new Error('Failed to fetch changelog')
      }
      items.value = parseChangelog(data)
    } catch {
      error.value = true
    }
  }

  watch(
    cachedChangelogs,
    (v) => {
      if (v) items.value = parseChangelog(v)
    },
    { immediate: true }
  )

  onMounted(() => {
    fetchChangelog()
  })
</script>

<style scoped>
  .changelog-item:hover {
    background-color: var(--color-surface-hover);
    border-radius: 4px;
    cursor: pointer;
  }
</style>
