<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <TooltipTTooltip
    :content="
      storeSelection.selectionClients.length < 1
        ? $t('message.selectClientsToProcessActions')
        : $t('processActions.help')
    "
  >
    <el-button
      @click="openProcessActionsModal = true"
      :disabled="storeSelection.selectionClients.length < 1"
      :type="props.type"
    >
      <IconIIcon :icon="icons.onDemand" />
    </el-button>
  </TooltipTTooltip>

  <el-dialog
    v-model="openProcessActionsModal"
    :title="$t('onDemand')"
    append-to-body
    :width="mq.isMobile.value ? '100%' : '80%'"
  >
    <PanelPOnDemand :with-footer="true" />
  </el-dialog>
</template>

<script setup lang="ts">
  const $t = useI18n().t
  const icons = useIcons()
  const mq = useMQ()
  const storeSelection = storeSelections()

  const openProcessActionsModal = ref(false)
  const props = defineProps({
    type: {
      type: String as () => 'primary' | 'success' | 'info' | 'warning' | 'danger',
      default: 'primary',
    },
  })
</script>
