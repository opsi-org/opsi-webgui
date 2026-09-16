<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  SupportWhatsNew - Release notes display.
-->
<template>
  <CoreAppCard class="h-full min-h-0" :ui="{ root: 'h-full min-h-0 flex flex-col', body: 'flex-1 min-h-0 overflow-y-auto p-2' }">
    <template #header>
      <CoreAppHeading :icon="icons.whatsNew" :text="$t('support.whatsNew')" />
    </template>

    <div v-if="loading" class="flex justify-center py-4">
      <CoreAppLoadingSpinner />
    </div>

    <div v-else-if="error" class="text-xs text-(--color-text-muted)">
      {{ $t('products.changelog.none') }}
    </div>
    <div v-else-if="releases.length" class="space-y-2 flex-1">
      <section v-for="release in releases" :key="release.version" class="border-b border-(--ui-border) pb-2 last:border-b-0">
        <div class="flex items-baseline gap-1.5 px-1">
          <span class="font-semibold text-sm">{{ release.version }}</span>
          <span class="text-xs text-(--color-text-muted)">- {{ release.date }}</span>
        </div>
        <div v-for="section in release.sections" :key="section.name" class="mt-1.5">
          <h3 class="px-1 text-xs font-semibold text-(--color-text-muted)">{{ section.name }}</h3>
          <div
            v-for="(item, idx) in section.items"
            :key="`${section.name}-${idx}`"
            class="changelog-item flex items-start gap-1.5 text-xs leading-snug py-0.5 px-1"
          >
            <CoreAppIcon :name="icons.minus" class="h-3.5 w-2 mt-0.5 shrink-0" />
            <span>{{ item }}</span>
          </div>
        </div>
      </section>
    </div>
    <div v-else class="text-xs text-(--color-text-muted)">
      {{ $t('products.changelog.none') }}
    </div>

    <template v-if="!loading && !error && releases.length" #footer>
      <div class="text-xs text-(--color-text-muted)">{{ $t('common.version') }}: {{ version }}</div>
    </template>
  </CoreAppCard>
</template>

<script setup lang="ts">
  const icons = useIcons()
  const { t: $t } = useI18n()
  const config = useRuntimeConfig()
  const { changelogs: cachedChangelogs, changelogsLoading, fetchChangelogs } = useCachedData()

  const error = ref(false)
  type ChangelogSection = { name: string; items: string[] }
  type ChangelogRelease = { version: string; date: string; sections: ChangelogSection[] }

  const releases = ref<ChangelogRelease[]>([])

  const loading = changelogsLoading
  const version = computed(() => config.public.packageVersion || '-')

  function parseChangelog(markdown: string): ChangelogRelease[] {
    const lines = markdown.split('\n')
    const parsedReleases: ChangelogRelease[] = []
    let currentRelease: ChangelogRelease | undefined
    let currentSection: ChangelogSection | undefined

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      const releaseMatch = trimmed.match(/^##\s+\[([^\]]+)\](?:\s+-\s*(.+))?$/)
      if (releaseMatch) {
        const version = releaseMatch[1]
        if (version === undefined) continue
        const release: ChangelogRelease = { version, date: releaseMatch[2] || '', sections: [] }
        currentRelease = release
        parsedReleases.push(release)
        currentSection = undefined
        continue
      }

      if (trimmed.startsWith('### ') && currentRelease) {
        currentSection = { name: trimmed.replace(/^###\s+/, '').trim(), items: [] }
        currentRelease.sections.push(currentSection)
        continue
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        currentSection?.items.push(trimmed.substring(2).trim())
      }
    }
    return parsedReleases.filter((release) => release.sections.some((section) => section.items.length))
  }

  async function fetchChangelog() {
    error.value = false
    try {
      const data = await fetchChangelogs()
      if (!data) {
        throw new Error('Failed to fetch changelog')
      }
      releases.value = parseChangelog(data)
    } catch {
      error.value = true
    }
  }

  watch(
    cachedChangelogs,
    (v) => {
      if (v) releases.value = parseChangelog(v)
    },
    { immediate: true },
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
