<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <TooltipTTooltip>
    <template #tooltip>
      {{ $t('form.autorefresh.cbvalue.tooltip') }}
    </template>
    <template #default>
      <PFloatLabel v-if="props.type === 'checkbox'" variant="in">
        <PToggleSwitch
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
          >{{
            msgbusAutoRefresh
              ? $t('form.autorefresh.cbvalue.on')
              : $t('form.autorefresh.cbvalue.off')
          }}</label
        >
      </PFloatLabel>
    </template>
  </TooltipTTooltip>
</template>

<script setup lang="ts">
  const $t = useI18n().t

  const { msgbusAutoRefresh } = storeToRefs(storeSettings())

  const props = defineProps({
    type: { type: String, default: 'checkbox' },
  })
</script>
