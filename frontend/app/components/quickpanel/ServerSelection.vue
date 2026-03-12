<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
	<div class="space-y-2">
		<UButton v-if="stateStore.selectedServers.length" @click="stateStore.clearServers()" size="xs" block
			color="neutral" variant="ghost">
			Clear All
		</UButton>
		<div v-if="loading" class="flex justify-center py-4">
			<UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
		</div>
		<div v-else-if="servers.length" class="space-y-1">
			<label v-for="server in servers" :key="server"
				class="flex items-center gap-2 p-1.5 rounded hover:bg-[--color-surface] cursor-pointer">
				<input type="checkbox" :checked="stateStore.selectedServers.includes(server)"
					@change="stateStore.toggleServer(server)" class="rounded" />
				<span class="text-xs">{{ server }}</span>
			</label>
		</div>
		<div v-else class="text-center py-4 text-xs text-[--color-text-muted]">No servers</div>
	</div>
</template>

<script setup lang="ts">
const stateStore = useStateStore()
const { getDepots } = useApiHelpers()
const servers = ref<string[]>([])
const loading = ref(false)

onMounted(async () => {
	loading.value = true
	try {
		const result = await getDepots({})
		if (result.data) servers.value = result.data.map((s: any) => s.depotId || s.id || s)
	} catch (e) {
		console.error(e)
	} finally {
		loading.value = false
	}
})
</script>
