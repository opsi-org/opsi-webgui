<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div
    :class="[
      'flex flex-col items-stretch p-2 rounded-lg shadow-md',
      isDarkMode
        ? 'bg-opsi-base-dark-background'
        : 'bg-opsi-base-light-background',
    ]"
    data-testid="BQuickPanel"
    style="height: calc(100vh - var(--above-main))"
  >
    <section class="mb-0">
      <header class="flex justify-between items-center mb-2">
        <el-text tag="b" size="small">{{ $t('label.quickselect') }}</el-text>
        <el-button
          size="small"
          class="!border-none p-1"
          :title="$t('button.selection.clear.all')"
          @click="storeSelection.clearAllSelection"
        >
          <IconIIcon :icon="icons.clear" />
          <span class="sr-only">{{ $t('button.resetAll') }}</span>
        </el-button>
      </header>
      <TabsTQuickSelections />
    </section>
    <section class="mt-4 mb-0">
      <header class="mb-2">
        <el-text tag="b" size="small">{{ $t('label.quickaction') }}</el-text>
      </header>
      <div class="flex justify-evenly">
        <DropdownDDClientActions
          :client-ids="storeSelection.selectionClients"
          icon="client"
          :link="false"
        />
        <DialogDProductQuickActions />
        <!-- <ModalMChanges v-if="$mq === 'mobile'" v-model="changes" /> -->
      </div>
    </section>
    <section class="mb-0">
      <header class="mb-2">
        <el-text tag="b" size="small">{{ $t('title.settings') }}</el-text>
      </header>
      <div class="flex justify-evenly">
        <SwitchSMultiselection />
        <!-- <SwitchSQuicksave /> -->
        <SwitchSAutoRefresh />
      </div>
    </section>
    <footer class="p-4 mt-auto insert-x-0 bottom-0 grid">
      <small class="justify-self-stretch text-center">
        {{ $t('message.login.currentUser', { user: username }) }}
        {{ $t('label.in_bracets', { value: getText(sessionExpiresIn) }) }}
      </small>
      <div class="flex justify-evenly items-center">
        <SwitchSTheme />
        <DropdownDDLang />
        <PopconfirmPLogout />
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
  import { useTimer } from '~/composables/mixins/useCounter'

  const { username, sessionExpiresIn } = storeToRefs(storeAuth())
  const getText = useTimer(false).getText

  const $t = useI18n().t
  // const $mq = useMQ().$mq
  const icons = useIcons()
  const storeSelection = storeSelections()
  const settings = storeSettings()
  // const changes = storeChanges()

  const isDarkMode = computed({
    get: () => settings.colormode === 'dark',
    set: (value: boolean) => {
      settings.setColormode(value ? 'dark' : 'light')
    },
  })
</script>
