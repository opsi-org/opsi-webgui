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
			<nav class="flex items-center gap-1.5 text-xs overflow-x-auto" tabindex="0" :aria-label="t('breadcrumb')">
				<template v-for="(crumb, i) in breadcrumbs" :key="i">
					<CoreAppIcon v-if="i > 0" :name="icons.chevronRight"
						class="w-2.5 h-2.5 text-(--color-text-muted) shrink-0" />
					<NuxtLink v-if="crumb.to" :to="crumb.to"
						class="text-(--color-text-muted) hover:text-opsi-blue whitespace-nowrap">
						{{ crumb.label }}
					</NuxtLink>
					<span v-else class="text-(--color-text) font-medium whitespace-nowrap">
						{{ crumb.label }}
					</span>
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

const t = (key: string) => {
	const translated = i18nT(key)
	if (translated && translated !== key) return String(translated)
	return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
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
		const label = isHostname ? segment : t(segment)
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
		'dashboard': t('pageDescription.dashboard'),
		'admin/terminal': t('pageDescription.admin.terminal'),
		'admin/diagnostics/healthcheck': t('pageDescription.admin.diagnostics.healthcheck'),
		'admin/diagnostics/modules': t('pageDescription.admin.diagnostics.modules'),
		'admin/diagnostics/system': t('pageDescription.admin.diagnostics.system'),
		'admin/maintenance': t('pageDescription.admin.maintenance'),
		'servers': t('pageDescription.servers'),
		'servers/configuration/parameters': t('pageDescription.servers.configuration.parameters'),
		'servers/configuration/attributes': t('pageDescription.servers.configuration.attributes'),
		'clients': t('pageDescription.clients'),
		'clients/add': t('pageDescription.clients.add'),
		'clients/clone': t('pageDescription.clients.clone'),
		'clients/configuration/parameters': t('pageDescription.clients.configuration.parameters'),
		'clients/configuration/attributes': t('pageDescription.clients.configuration.attributes'),
		'clients/logs': t('pageDescription.clients.logs'),
		'products': t('pageDescription.products'),
		'groups': t('pageDescription.groups'),
		'support': t('pageDescription.support'),
	}
	if (exactMatches[normalizedPath]) return exactMatches[normalizedPath]

	// Match paths with dynamic host/client IDs at the end (e.g. clients/configuration/parameters/aa21.acme.corp)
	const prefixMatches: [RegExp, string][] = [
		[/^clients\/configuration\/parameters\//, t('pageDescription.clients.configuration.parameters')],
		[/^clients\/configuration\/attributes\//, t('pageDescription.clients.configuration.attributes')],
		[/^clients\/logs\//, t('pageDescription.clients.logs')],
		[/^clients\/clone\//, t('pageDescription.clients.clone')],
		[/^servers\/configuration\/parameters\//, t('pageDescription.servers.configuration.parameters')],
		[/^servers\/configuration\/attributes\//, t('pageDescription.servers.configuration.attributes')],
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