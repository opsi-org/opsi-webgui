<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-form v-if="props.withLabel">
    <el-form-item :label="$t('autoRefresh')" class="!mb-0 flex justify-between">
      <p-float-label variant="in" :title="$t('autoRefreshTooltip')">
        <p-toggle-switch
          v-model="msgbusAutoRefresh"
          id="cbAutorefresh"
          name="autorefresh"
          :aria-label="
            'Switch auto-refresh mode. Currently is ' + (msgbusAutoRefresh ? 'on' : 'off')
          "
          style="--p-toggleswitch-width: 5rem"
          v-bind="$props"
        />
        <label
          for="cbAutorefresh"
          class="text-xs text-white !pb-1"
          :class="msgbusAutoRefresh ? '' : 'pl-4'"
          >{{ msgbusAutoRefresh ? $t('autoRefreshEnabled') : $t('ask') }}</label
        >
      </p-float-label>
    </el-form-item>
  </el-form>
  <p-float-label v-else variant="in" :title="$t('autoRefreshTooltip')">
    <p-toggle-switch
      v-model="msgbusAutoRefresh"
      id="cbAutorefresh"
      name="autorefresh"
      :aria-label="'Switch auto-refresh mode. Currently is ' + (msgbusAutoRefresh ? 'on' : 'off')"
      style="--p-toggleswitch-width: 5rem"
      v-bind="$props"
    />
    <label
      for="cbAutorefresh"
      class="text-xs text-white !pb-1"
      :class="msgbusAutoRefresh ? '' : 'pl-4'"
      >{{ msgbusAutoRefresh ? $t('autoRefreshEnabled') : $t('ask') }}</label
    >
  </p-float-label>
</template>

<script setup lang="ts">
  const $t = useI18n().t

  const { msgbusAutoRefresh } = storeToRefs(storeSettings())

  const props = defineProps({
    withLabel: { type: Boolean, default: true },
  })
</script>
