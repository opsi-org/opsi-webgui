<template>
  <div class="quickpanel" data-testid="BQuickPanel">
    <el-row>
      <el-text tag="b" size="small"> {{ $t('label.quickselect') }}</el-text
      ><br />
      <el-button size="small" class="border-0 ml-auto">
        <span class="sr-only">{{ $t('button.resetAll') }}</span>
        <IconIIcon :icon="icons.reset" @click="storeSelection.clearAllSelection" />
      </el-button>
    </el-row>
    <TabsTQuickSelections />

    <el-row>
      <el-text tag="b" size="small"> {{ $t('label.quickaction') }}</el-text>
    </el-row>
    <div class="flex justify-evenly">
      <DropdownDDClientActions :clientIds="storeSelection.selectionClients" icon="client" />
      <DialogDProductQuickActions />
    </div>

    <el-row>
      <el-text tag="b" size="small"> {{ $t('title.settings') }}</el-text>
    </el-row>
    <div class="flex justify-evenly">
      <FormitemCBMultiselection />
      <FormitemCBQuicksave />
    </div>

    <el-row>
      <el-text tag="b" size="small"> {{ $t('Tracked Changes') }}</el-text>
    </el-row>
    <el-scrollbar v-if="changes.changesHostParam" class="max-h-48 overflow-scroll">
      <pre> {{ changes.changesHostParam }}</pre>
    </el-scrollbar>
    <el-scrollbar v-if="changes.changesProducts" class="max-h-48 overflow-scroll">
      <pre> {{ changes.changesProducts }}</pre>
    </el-scrollbar>

    <div class="fixed bottom-0 flex justify-evenly">
      <PopconfirmPLogout v-if="mq.isMobile.value" />
      <FormitemDDTheme />
      <FormitemDDLang />
    </div>

    <el-text>{{ $t('label.version') }}</el-text>
    <el-text class="BAuthFooter-version">{{ $config.public.packageVersion }}</el-text>
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
