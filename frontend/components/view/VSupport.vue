<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div data-testid="VSupport" class="w-100 min-w-1/1">
    <div
      class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
      id="support-boxes"
    >
      <div
        v-for="item in supportItems"
        :key="item.title"
        class="p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
      >
        <div class="flex items-center">
          <div class="ml-4">
            <h3 class="mt-4 text-lg font-semibold">{{ $t(item.title) }}</h3>
            <p>{{ $t(item.description) }}</p>
          </div>
        </div>
        <a
          :href="item.link"
          target="_blank"
          class="inline-block mt-1 px-4 py-2 rounded transition-colors duration-300"
        >
          {{ $t(item.buttonname) }}
        </a>
      </div>
    </div>
    <div v-if="withIframe">
      <iframe
        class="opsidoc-frame w-100 min-w-1/1 border border-red-500"
        :style="
          `max-height: ${maxVisibleHeight}px;` +
          `height: ${maxVisibleHeight}px;` +
          `min-height: ${maxVisibleHeight}px;`
        "
        :src="documentationUrl"
        :title="$t('supportPage.documentation.title')"
      />
    </div>
    <div v-else>
      {{ $t('supportPage.support.opsi-doc-disabled') }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useDynamicHeight } from '~/composables/mixins/useDynamicHeightWindow'

  const locale = useI18n().locale
  const $t = useI18n().t

  defineProps({
    withIframe: { type: Boolean, default: true },
  })

  const supportItems = computed(() => [
    {
      title: 'supportPage.forum.title',
      description: 'supportPage.forum.description',
      buttonname: 'supportPage.forum.button',
      link: 'https://forum.opsi.org/index.php',
    },
    {
      title: 'title.support',
      description: 'supportPage.support.description',
      buttonname: 'supportPage.support.button',
      link:
        locale.value === 'en'
          ? 'https://www.uib.de/en/support-training/support'
          : 'https://www.uib.de/de/support-schulung/support',
    },
  ])
  const { maxVisibleHeight } = useDynamicHeight(
    ['btop-header', 'globalBreadcrumb', 'support-boxes'],
    0,
  )

  const documentationUrl = computed(() =>
    locale.value === 'de'
      ? 'https://docs.opsi.org/opsi-docs-de/4.3/index.html'
      : 'https://docs.opsi.org/opsi-docs-en/4.2/index.html',
  )
</script>

<style scoped>
  .opsidoc-frame {
    min-height: calc(100vh - 270px);
    max-height: calc(100vh - 270px);
  }
</style>
