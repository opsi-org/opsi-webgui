<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-dropdown data-testid="language-dropdown" @command="change">
    <el-button link>
      <IconIIcon :icon="icons.language" class="inline mr-1" />
      <el-text>{{ locale.toUpperCase() }}</el-text>
      <i class="el-icon-arrow-down el-icon--right"></i>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="(lang, i) in availableLocales"
          :key="i"
          :command="lang"
          :class="{ 'is-active': lang === locale }"
          :data-testid="`language-dropdown-item-${lang}`"
        >
          <span style="text-transform: uppercase">{{ lang }}</span>
          <span>{{
            ['en', 'de', 'fr'].includes(lang) ? '' : $t('maintainedByOPSICommunity')
          }}</span>
        </el-dropdown-item>
        <el-dropdown-item
          divided
          :data-testid="`DropdownDDLang-Item-contribute`"
          :title="$t('message.contributeTranslations')"
        >
          <a
            href="https://app.transifex.com/opsi-org/opsiorg/opsi-webguijson/"
            target="_blank"
            class="dropdown-item-link"
          >
            {{ $t('message.translationMissing') }}
          </a>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
  const { availableLocales, locale, setLocale } = useI18n()
  const $t = useI18n().t
  const icons = useIcons()

  const _props = defineProps({
    footer: { type: Boolean, default: false },
  })

  function change(event: any) {
    setLocale(event)
    storeSettings().setLanguage(event)
  }
</script>
