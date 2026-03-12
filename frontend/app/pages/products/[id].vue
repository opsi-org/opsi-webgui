<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0

Redirect page for direct product links - redirects to products list
-->
<template>
	<div class="flex items-center justify-center h-64">
		<div class="text-center">
			<UIcon :name="icons.loading" class="w-8 h-8 animate-spin mx-auto text-opsi-blue" />
			<p class="mt-2 text-(--color-text-muted)">{{ $t('message.page.redirect') }}</p>
		</div>
	</div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()
const route = useRoute()
const router = useRouter()

// Redirect to products list with the product ID in query params
onMounted(() => {
	const productId = route.params.id as string
	router.replace({
		path: '/products',
		query: { product: productId }
	})
})
</script>
