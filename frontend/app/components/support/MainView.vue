<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  SupportMainView - Help page with professional support, community forum, documentation links and changelogs.
-->
<template>
  <LayoutsPageLayout :showFilter="false" :showRefresh="false" class="opsi-compact-page opsi-dense-form">
    <div class="w-full flex flex-col gap-4 h-full min-h-[calc(100vh-120px)]">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CoreAppCard fill>
          <template #header>
            <CoreAppHeading :icon="icons.support" :text="$t('support.pro')" />
          </template>
          <p class="text-sm text-(--color-text-muted) mb-4">{{ $t('support.proDesc') }}</p>
          <CoreAppButton variant="outline" color="primary" block as="a" :href="supportUrl" target="_blank">{{
            $t('support.title')
          }}</CoreAppButton>
        </CoreAppCard>
        <CoreAppCard fill>
          <template #header>
            <CoreAppHeading :icon="icons.users" :text="$t('support.community')" />
          </template>
          <p class="text-sm text-(--color-text-muted) mb-4">{{ $t('support.communityDesc') }}</p>
          <CoreAppButton variant="outline" color="primary" block as="a" href="https://forum.opsi.org" target="_blank">
            {{ $t('support.forum') }}</CoreAppButton
          >
        </CoreAppCard>
        <CoreAppCard fill>
          <template #header>
            <CoreAppHeading :icon="icons.document" :text="$t('support.docs')" />
          </template>
          <p class="text-sm text-(--color-text-muted) mb-4">{{ $t('support.docsDesc') }}</p>
          <CoreAppButton variant="outline" color="primary" block as="a" :href="docsUrl" target="_blank">
            {{ $t('support.docs') }}
          </CoreAppButton>
        </CoreAppCard>
      </div>
      <div class="flex-1 min-h-0">
        <SupportWhatsNew />
      </div>
    </div>
  </LayoutsPageLayout>
</template>

<script setup lang="ts">
  const icons = useIcons()
  const { t: $t, locale } = useI18n()
  const supportUrl = computed(() =>
    locale.value === 'de' ? 'https://opsi.org/de/services/support/' : 'https://opsi.org/en/services/support/',
  )
  const docsUrl = computed(() =>
    locale.value === 'de'
      ? 'https://docs.opsi.org/opsi-docs-de/4.3/gui/webgui.html'
      : 'https://docs.opsi.org/opsi-docs-en/4.3/gui/webgui.html',
  )
</script>
