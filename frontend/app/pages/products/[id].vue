<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ProductDetailPage - Route page for individual product detail/redirect.
-->
<template>
  <div class="flex items-center justify-center h-64">
    <div class="text-center">
      <CoreAppLoadingSpinner />
      <p class="mt-2 text-(--color-text-muted)">{{ $t('nav.redirect') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({ layout: 'default' })

  const { t: $t } = useI18n()
  const route = useRoute()
  const router = useRouter()

  onMounted(() => {
    const productId = route.params.id as string
    router.replace({
      path: '/products',
      query: { product: productId },
    })
  })
</script>
