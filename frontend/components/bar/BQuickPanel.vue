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
          @click="storeSelection.clearAllSelection"
        >
          <IconIIcon :icon="icons.reset" />
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
        />
        <DialogDProductQuickActions />
        <ModalMChanges v-if="$mq === 'mobile'" v-model="changes" />
      </div>
    </section>
    <section class="mb-0">
      <header class="mb-2">
        <el-text tag="b" size="small">{{ $t('title.settings') }}</el-text>
      </header>
      <div class="flex justify-evenly">
        <SwitchSMultiselection />
        <SwitchSQuicksave />
        <SwitchSAutoRefresh />
      </div>
    </section>
    <footer class="p-4 mt-auto insert-x-0 bottom-0">
      <div class="flex justify-evenly items-center">
        <SwitchSTheme />
        <DropdownDDLang />
        <PopconfirmPLogout />
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
  import { useIcons } from '../../composables/mixins/useIcons'
  const $t = useI18n().t
  const $mq = useMQ().$mq
  const icons = useIcons()
  const storeSelection = storeSelections()
  const settings = storeSettings()
  const changes = storeChanges()

  const isDarkMode = computed({
    get: () => settings.colormode === 'dark',
    set: (value: boolean) => {
      settings.setColormode(value ? 'dark' : 'light')
    },
  })
</script>
