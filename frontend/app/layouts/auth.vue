<!--
  This file is part of the OPSI-WebGUI application.
  OPSI-WebGUI is the web-based management interface for OPSI.
  https://opsi.org/en/

  Copyright (c) UIB GmbH info@uib.de 2026
  All rights reserved.
  License: AGPL-3.0

  AuthLayout - provides a centered login form and a footer with theme/language options.
-->
<template>
  <div class="min-h-screen flex flex-col bg-(--color-surface)">
    <main class="flex-1 flex items-center justify-center p-4">
      <div class="w-full max-w-lg">
        <slot />
      </div>
    </main>
    <LayoutsAuthFooter :version="$config.public.packageVersion || '1.0.0'" :uib-link="uibLink" />
  </div>
</template>

<script setup lang="ts">
  const $config = useRuntimeConfig()
  const { locale } = useI18n()

  const uibLink = computed(() => {
    return locale.value === 'de' ? 'https://uib.de/de/' : 'https://uib.de/en/'
  })
</script>
