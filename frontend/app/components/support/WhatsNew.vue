<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

SupportWhatsNew - Displays changelog.
-->
<template>
	<UCard>
		<template #header>
			<div class="flex items-center gap-2">
				<UIcon :name="icons.info" class="w-5 h-5 text-opsi-blue" />
				<span class="font-medium">{{ $t('whatsNew') }}</span>
			</div>
		</template>

		<div v-if="loading" class="flex justify-center py-4">
			<UIcon :name="icons.loading" class="w-5 h-5 animate-spin text-opsi-blue" />
		</div>

		<div v-else-if="error" class="text-sm text-[--color-text-muted]">
			{{ $t('changelogNotAvailable') }}
		</div>
		<div v-else class="space-y-2 max-h-100 overflow-y-auto">
			<div v-for="(item, idx) in items" :key="idx" class="changelog-item flex items-start gap-2 text-sm pb-2">
				<UIcon :name="getItemIcon(item)" :class="getItemIconClass(item)" class="w-4 h-4 mt-0.5 shrink-0" />
				<span :class="getItemTextClass(item)">{{ formatItem(item) }}</span>
			</div>
		</div>

		<template v-if="!loading && !error && items.length" #footer>
			<div class="text-xs text-[--color-text-muted]">
				{{ $t('version') }}: {{ version }}
			</div>
		</template>
	</UCard>
</template>

<script setup lang="ts">

const icons = useIcons()
const { t: $t } = useI18n()
const config = useRuntimeConfig()
const { getChangelogs } = useApiHelpers()

const loading = ref(true)
const error = ref(false)
const items = ref<string[]>([])

const version = computed(() => config.public.packageVersion || '—')

function parseChangelog(markdown: string): string[] {
	const lines = markdown.split('\n')
	const parsedItems: string[] = []

	for (const line of lines) {
		const trimmed = line.trim()
		if (!trimmed || trimmed.startsWith('#')) continue
		if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
			parsedItems.push(trimmed.substring(2).trim())
		} else if (trimmed.startsWith('[') && trimmed.includes(']')) {
			parsedItems.push(trimmed)
		}
	}

	return parsedItems
}

function getItemIcon(item: string): string {
	const lowerItem = item.toLowerCase()
	if (lowerItem.includes('[fix]') || lowerItem.startsWith('fix')) return icons.check
	if (lowerItem.includes('[add]') || lowerItem.includes('[new]') || lowerItem.startsWith('add')) return icons.add
	if (lowerItem.includes('[change]') || lowerItem.includes('[update]')) return icons.refresh
	if (lowerItem.includes('[remove]') || lowerItem.includes('[delete]')) return icons.delete
	if (lowerItem.includes('[security]')) return icons.lock
	if (lowerItem.includes('[deprecate]')) return icons.warning
	return icons.check
}

function getItemIconClass(item: string): string {
	const lowerItem = item.toLowerCase()
	if (lowerItem.includes('[fix]') || lowerItem.startsWith('fix')) return 'text-[--color-opsi-success]'
	if (lowerItem.includes('[add]') || lowerItem.includes('[new]')) return 'text-opsi-blue'
	if (lowerItem.includes('[security]')) return 'text-[--color-opsi-error]'
	if (lowerItem.includes('[deprecate]')) return 'text-[--color-opsi-warning]'
	return 'text-[--color-text-muted]'
}

function getItemTextClass(item: string): string {
	const lowerItem = item.toLowerCase()
	if (lowerItem.includes('[security]')) return 'text-[--color-opsi-error]'
	return ''
}

function formatItem(item: string): string {
	// Remove common prefixes like [fix], [add], etc.
	return item.replace(/^\[(fix|add|new|change|update|remove|delete|security|deprecate|pub|cg)\]\s*/gi, '').trim()
}

async function fetchChangelog() {
	loading.value = true
	error.value = false

	try {
		const result = await getChangelogs()
		if (result.error || !result.data) {
			throw new Error('Failed to fetch changelog')
		}
		items.value = parseChangelog(result.data)
	} catch (e) {
		console.error('Failed to fetch changelog:', e)
		error.value = true
	} finally {
		loading.value = false
	}
}

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
