<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-menu
    mode="horizontal"
    :ellipsis="false"
    class="bg-opsi-blue"
    data-testid="BTop"
  >
    <el-menu-item
      v-if="mq.isMobile.value"
      index="0"
      type="text"
      @click="toggleLeft"
      data-testid="menu_routes"
      class="min-w-14 w-14"
      style="--el-menu-hover-bg-color: var(--color-opsi-deep-blue)"
    >
      <IconIIcon :icon="icons.navmenu" class="text-white" />
    </el-menu-item>

    <div v-if="mq.isMobile.value" class="flex-grow" />
    <el-menu-item
      index="1"
      @click="navigateToClients"
      class="!bg-transparent !hover:!bg-transparent"
    >
      <IconIOpsiLogo class="opsi-logo" />
      <span class="text-xs ml-1 mb-4 text-white">
        {{ t_fixed('title.project.webgui') }}
        {{ $config.public.packageVersion }}
      </span>
    </el-menu-item>

    <div class="flex-grow" />
    <!-- <el-menu-item
      v-if="changesExists"
      @click="openDialog"
      index="2"
      type="text"
      data-testid="menu-changes"
      class="!bg-transparent"
    >
      <ModalMChanges
        v-if="$mq !== 'mobile'"
        v-model="changes"
        v-model:visible="changesDialogVisible"
        small
        transparent
      />
    </el-menu-item> -->

    <el-menu-item
      v-if="storeConfigapp().config?.read_only"
      disbled
      index="3"
      type="text"
      style="--el-menu-hover-bg-color: var(--color-opsi-deep-blue)"
    >
      <TooltipTTooltip>
        <template #tooltip>
          <p>{{ $t('info.readonly.active') }}</p>
        </template>
        <IconIIcon :icon="icons.readonly" class="text-red-500" height="20" />
      </TooltipTTooltip>
    </el-menu-item>
    <el-menu-item
      index="4"
      type="text"
      @click="toggleRight"
      data-testid="menu-quickpanel"
      class="bg-transparent"
      style="--el-menu-hover-bg-color: var(--color-opsi-deep-blue)"
    >
      <IconIIcon :icon="icons.quickpanel" class="text-white" />
    </el-menu-item>
    <PopconfirmPLogout />
  </el-menu>
</template>

<script setup lang="ts">
  import { useStrings } from '~/composables/mixins/useStrings'
  import { useRouter } from 'vue-router'

  const mq = useMQ()
  const $config = useRuntimeConfig()
  const emit = defineEmits(['toggleLeft', 'toggleRight'])
  const icons = useIcons()
  const router = useRouter()
  const { t_fixed } = useStrings()

  const toggleLeft = () => emit('toggleLeft')
  const toggleRight = () => emit('toggleRight')
  const navigateToClients = () => router.push('/clients/')
</script>

<style scoped>
  .opsi-logo {
    height: 40px;
  }
</style>
