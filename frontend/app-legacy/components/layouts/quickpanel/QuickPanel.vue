<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div
    class="flex flex-col items-stretch p-2 rounded-lg shadow-md"
    data-testid="BQuickPanel"
    style="height: calc(100vh - var(--above-main))"
  >
    <section class="mb-0">
      <header class="flex justify-between items-center mb-2">
        <el-text tag="b" size="small">{{ $t('quickSelect') }}</el-text>
        <el-button
          size="small"
          class="!border-none p-1"
          :title="$t('clearAllSelections')"
          @click="storeSelection.clearAllSelection"
        >
          <IconIIcon :icon="icons.clear" />
          <span class="sr-only">{{ $t('resetAll') }}</span>
        </el-button>
      </header>
      <TabsTQuickSelections />
    </section>
    <section class="mt-4 mb-0">
      <header class="mb-2">
        <el-text tag="b" size="small">{{ $t('quickActions') }}</el-text>
      </header>
      <div class="flex justify-evenly">
        <DropdownDDClientActions
          :client-ids="storeSelection.selectionClients"
          icon="client"
          :link="false"
          :disabled="
            storeSelection.selectionClients.length === 0 || storeConfigapp().config?.read_only
          "
        />
        <DialogDProductQuickActions />
      </div>
    </section>
    <section class="mb-0">
      <header class="mb-2">
        <el-text tag="b" size="small">{{ $t('settings') }}</el-text>
      </header>
      <div class="mx-2">
        <SwitchSMultiselection />
        <SwitchSAutoRefresh />
      </div>
    </section>
    <footer class="p-4 mt-auto insert-x-0 bottom-0 grid">
      <small class="justify-self-stretch text-center">
        {{ $t('message.login.currentUser', { user: username }) }}
        {{ $t('textInBrackets', { value: getText(sessionExpiresIn) }) }}
      </small>
      <div class="flex justify-evenly items-center">
        <SwitchSTheme />
        <DropdownDDLang />
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
  import { useTimer } from '~/composables/mixins/useCounter'

  const { username, sessionExpiresIn } = storeToRefs(storeAuth())
  const getText = useTimer(false).getText

  const $t = useI18n().t
  const icons = useIcons()
  const storeSelection = storeSelections()
</script>
