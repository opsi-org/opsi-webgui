SupportWhatsNew - Displays changelog.
<template>
	<UCard>
		<template #header>
			<div class="flex items-center gap-2">
				<UIcon :name="icons.whatsNew" class="w-5 h-5" />
				<span class="font-medium">{{ $t('whatsNew') }}</span>
			</div>
		</template>

		<div v-if="loading" class="flex justify-center py-4">
			<SharedLoadingSpinner />
		</div>

		<div v-else-if="error" class="text-sm text-[--color-text-muted]">
			{{ $t('changelogNotAvailable') }}
		</div>
		<div v-else class="space-y-2 max-h-100 overflow-y-auto">
			<div v-for="(item, idx) in items" :key="idx" class="changelog-item flex items-start gap-2 text-sm pb-2">
				<UIcon :name="icons.minus" class="h-5 w-2" />
				<span>{{ item.text }}</span>
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
const { changelogs: cachedChangelogs, changelogsLoading, fetchChangelogs } = useCachedData()

const error = ref(false)
const items = ref<{ section: string, text: string }[]>([])

const loading = changelogsLoading
const version = computed(() => config.public.packageVersion || '—')

function parseChangelog(markdown: string): { section: string, text: string }[] {
	const lines = markdown.split('\n')
	const parsedItems: { section: string, text: string }[] = []
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
	} catch (e) {
		console.error('Failed to fetch changelog:', e)
		error.value = true
	}
}

watch(cachedChangelogs, (v) => {
	if (v) items.value = parseChangelog(v)
}, { immediate: true })

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
