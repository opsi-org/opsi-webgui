<template>
  <div class="flex flex-col h-full p-4 rounded-lg shadow-md" data-testid="BQuickPanel">
    <section class="mb-4">
      <header class="flex justify-between items-center mb-2">
        <el-text tag="b" size="small">{{ $t('label.quickselect') }}</el-text>
        <el-button size="small" class="border-0 p-1" @click="storeSelection.clearAllSelection">
          <IconIIcon :icon="icons.reset" />
          <span class="sr-only">{{ $t('button.resetAll') }}</span>
        </el-button>
      </header>
      <TabsTQuickSelections />
    </section>
    <section class="mb-4">
      <header class="mb-2">
        <el-text tag="b" size="small">{{ $t('label.quickaction') }}</el-text>
      </header>
      <div class="flex justify-evenly">
        <DropdownDDClientActions :client-ids="storeSelection.selectionClients" icon="client" />
        <DialogDProductQuickActions />
      </div>
    </section>
    <section class="mb-4">
      <header class="mb-2">
        <el-text tag="b" size="small">{{ $t('title.settings') }}</el-text>
      </header>
      <div class="flex justify-evenly">
        <FormitemCBMultiselection />
        <FormitemCBQuicksave />
      </div>
    </section>
    <section class="mb-4">
      <header class="mb-2">
        <el-text tag="b" size="small">{{ $t('Tracked Changes') }}</el-text>
      </header>
      <el-scrollbar v-if="changes.changesHostParam" class="max-h-48 overflow-scroll mb-2rounded-lg p-2 shadow-sm">
        <pre class="m-0 text-sm">{{ changes.changesHostParam }}</pre>
      </el-scrollbar>
      <el-scrollbar v-if="changes.changesProducts" class="max-h-48 overflow-scroll rounded-lg p-2 shadow-sm">
        <pre class="m-0 text-sm">{{ changes.changesProducts }}</pre>
      </el-scrollbar>
    </section>
    <footer class="p-4 mt-auto">
      <div class="flex justify-evenly items-center">
        <PopconfirmPLogout v-if="mq.isMobile.value" />
        <FormitemDDTheme />
        <FormitemDDLang />
      </div>
      <div class="text-center mt-2">
        <el-text>{{ $t('label.version') }}</el-text>
        <el-text class="BAuthFooter-version">{{ $config.public.packageVersion }}</el-text>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useIcons } from '../../composables/mixins/useIcons'
const $t = useI18n().t
const mq = useMQ()
const icons = useIcons()
const storeSelection = storeSelections()
const changes = storeChanges()
const $config = useRuntimeConfig()
</script>