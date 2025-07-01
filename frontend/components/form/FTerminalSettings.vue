<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-form label-width="50%" :label-position="mq.isMobile.value ? 'top' : 'left'">
    <el-form-item :label="$t('terminalID')">
      <el-input :disabled="disabled" v-model="modelTerminalId" />
    </el-form-item>
    <el-form-item :label="$t('terminalChannel')">
      <el-input :disabled="disabled" v-model="modelTerminalChannel" />
    </el-form-item>
    <div class="button-container" style="display: flex; justify-content: flex-end">
      <el-button
        :disabled="disabled"
        data-testid="terminal-connect-button"
        type="primary"
        @click="emit('click-connect')"
        >{{ $t('connectOrReconnect') }}</el-button
      >
      <el-button :disabled="disabled" type="primary" @click="emit('click-disconnect')">
        {{ $t('disconnect') }}</el-button
      >
    </div>
  </el-form>
</template>

<script setup lang="ts">
  const $t = useI18n().t
  const mq = useMQ()
  const modelTerminalId = defineModel('terminalId', {
    required: true,
    type: String,
  })
  const modelTerminalChannel = defineModel('terminalChannel', {
    required: true,
    type: String,
  })
  const emit = defineEmits([
    'update:terminalId',
    'update:terminalChannel',
    'click-connect',
    'click-disconnect',
  ])

  const _props = defineProps({
    disabled: { type: Boolean, default: false },
  })
</script>
