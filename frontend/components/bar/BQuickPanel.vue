<template>
  <div class="quickpanel" data-testid="BQuickPanel">
    <div class="flex">
      <el-text tag="b" size="small"> {{$t('label.quickselect')}}</el-text><br>
      <el-button size="small" class="border-0 ml-auto">
        <span class="sr-only">{{ $t('button.resetAll') }}</span>
        <IconIIcon :icon="icons.reset" @click="storeSelection.clearAllSelection" />
      </el-button>
    </div>
    <TabsTQuickSelections />
    <el-text tag="b" size="small"> {{$t('label.quickaction')}}</el-text><br />
      TODO:ondemand
      TODO:ProductQuickActions
      <br>
    <el-text tag="b" size="small"> {{$t('Tracked Changes')}}</el-text><br>
    <el-scrollbar v-if="changes.changesHostParam" class="max-h-48 overflow-scroll">
      <pre> {{ changes.changesHostParam }}</pre>
    </el-scrollbar>
    <el-scrollbar v-if="changes.changesProducts" class="max-h-48 overflow-scroll">
      <pre> {{ changes.changesProducts }}</pre>
    </el-scrollbar>
    <el-text tag="b" size="small"> {{$t('title.settings')}}</el-text><br>
    <div class="flex justify-evenly">
      <FormitemCBMultiselection />
      <FormitemCBQuicksave />
    </div>
    <el-text tag="b" size="small"> {{$t('title.gui')}}</el-text><br>
    <div class="flex justify-evenly">
      <FormitemDDTheme />
      <FormitemDDLang />
    </div>
    <div class="fixed bottom-4">
      <PopconfirmPLogout v-if="useMQ().isMobile.value" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {useIcons} from '../../composables/mixins/useIcons'
const icons = useIcons()
const storeSelection = storeSelections()
const changes = storeChanges()
</script>
