<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  LayoutsBreadCrumb - Breadcrumb navigation for current page context.
-->
<template>
  <div class="shrink-0 px-3 md:px-4 py-1.5 border-b border-(--color-border) bg-(--color-surface)">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
      <nav class="flex items-center gap-1.5 text-xs overflow-x-auto" :aria-label="$t('nav.breadcrumb')" tabindex="0">
        <template v-for="(crumb, i) in breadcrumbs" :key="i">
          <CoreAppIcon v-if="i > 0" :name="icons.chevronRight" class="w-2.5 h-2.5 text-(--color-text-muted) shrink-0" />
          <NuxtLink v-if="crumb.to" :to="crumb.to" class="text-(--color-text-muted) hover:text-opsi-blue whitespace-nowrap">
            {{ crumb.label }}
          </NuxtLink>
          <h1 v-else class="text-(--color-text) font-medium whitespace-nowrap text-xs m-0">
            {{ crumb.label }}
          </h1>
        </template>
      </nav>
      <span v-if="pageDescription" class="text-xs hidden sm:inline">
        {{ pageDescription }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  const icons = useIcons()

  const $route = useRoute()
  const { t: i18nT } = useI18n()

  const segmentI18nMap: Record<string, string> = {
    dashboard: 'nav.dashboard',
    admin: 'nav.admin',
    terminal: 'nav.terminal',
    diagnostics: 'nav.diagnostics',
    healthcheck: 'nav.healthcheck',
    modules: 'nav.modules',
    system: 'nav.systemInfo',
    maintenance: 'nav.maintenance',
    servers: 'nav.servers',
    clients: 'nav.clients',
    products: 'nav.products',
    groups: 'nav.groups',
    support: 'nav.support',
    configuration: 'nav.configuration',
    logs: 'nav.logs',
    clone: 'nav.clone',
    add: 'nav.addNew',
  }

  const $t = (key: string) => {
    const translated = i18nT(key)
    if (translated && translated !== key) return String(translated)
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim()
  }

  const translateSegment = (segment: string): string => {
    const normalized = decodeURIComponent(segment)
    const mappedKey = segmentI18nMap[normalized]
    if (mappedKey) return $t(mappedKey)

    const navKey = `nav.${normalized}`
    const navTranslated = i18nT(navKey)
    if (navTranslated && navTranslated !== navKey) return String(navTranslated)

    return $t(normalized)
  }

  const breadcrumbs = computed(() => {
    const path = $route.path
    const segments = path.split('/').filter(Boolean)
    if (!segments.length) return []

    const crumbs: { label: string; to?: string }[] = []
    let currentPath = ''

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isHostname = segment.includes('.') && !segment.includes(' ')
      const label = isHostname ? segment : translateSegment(segment)
      crumbs.push({
        label,
        to: index < segments.length - 1 ? currentPath : undefined,
      })
    })

    return crumbs
  })

  const getPageDescription = (path: string): string => {
    const normalizedPath = path.replace(/^\//, '')
    const exactMatches: Record<string, string> = {
      dashboard: $t('pages.dashboard'),
      'admin/terminal': $t('pages.admin.terminal'),
      'admin/diagnostics/healthcheck': $t('pages.admin.diag.health'),
      'admin/diagnostics/modules': $t('pages.admin.diag.mods'),
      'admin/diagnostics/system': $t('pages.admin.diag.system'),
      'admin/maintenance': $t('pages.admin.maintenance'),
      servers: $t('pages.servers'),
      'servers/configuration/parameters': $t('pages.serversConfigParams'),
      'servers/configuration/attributes': $t('pages.serversConfigAttrs'),
      clients: $t('pages.clients'),
      'clients/add': $t('pages.clientsAdd'),
      'clients/clone': $t('pages.clientsClone'),
      'clients/configuration/parameters': $t('pages.clientsConfigParams'),
      'clients/configuration/attributes': $t('pages.clientsConfigAttrs'),
      'clients/logs': $t('pages.clientsLogs'),
      products: $t('pages.products'),
      groups: $t('pages.groups'),
      support: $t('pages.support'),
    }
    if (exactMatches[normalizedPath]) return exactMatches[normalizedPath]

    // Match paths with dynamic host/client IDs at the end (e.g. clients/configuration/parameters/aa21.acme.corp)
    const prefixMatches: [RegExp, string][] = [
      [/^clients\/configuration\/parameters\//, $t('pages.clientsConfigParams')],
      [/^clients\/configuration\/attributes\//, $t('pages.clientsConfigAttrs')],
      [/^clients\/logs\//, $t('pages.clientsLogs')],
      [/^clients\/clone\//, $t('pages.clientsClone')],
      [/^servers\/configuration\/parameters\//, $t('pages.serversConfigParams')],
      [/^servers\/configuration\/attributes\//, $t('pages.serversConfigAttrs')],
    ]
    for (const [pattern, description] of prefixMatches) {
      if (pattern.test(normalizedPath)) return description
    }

    return ''
  }

  const pageDescription = computed(() => {
    return getPageDescription($route.path)
  })
</script>
