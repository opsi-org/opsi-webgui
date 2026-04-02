Redirect page for direct product links - redirects to products list
<template>
	<div class="flex items-center justify-center h-64">
		<div class="text-center">
			<UIcon :name="icons.refresh" class="w-8 h-8 animate-spin mx-auto text-opsi-blue" />
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

onMounted(() => {
	const productId = route.params.id as string
	router.replace({
		path: '/products',
		query: { product: productId }
	})
})
</script>
