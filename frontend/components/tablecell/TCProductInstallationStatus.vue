<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div data-testid="TCInstallationStatus">
    <p-tag
      v-if="props.text == 'mixed'"
      data-testid="TCInstallationStatusBadge"
      :severity="props.variant"
    >
      <IconIIcon :icon="icons.unequal" alt="mixed" />
    </p-tag>
    <p-tag
      v-else-if="props.text == 'installed'"
      data-testid="TCInstallationStatusBadge"
      severity="success"
    >
      <span class="h6">
        <IconIIcon :icon="icons.client" alt="installed" />
      </span>
    </p-tag>
    <p-tag
      v-else-if="props.text == 'unknown'"
      data-testid="TCInstallationStatusBadge"
      severity="warn"
    >
      <span class="h6">
        <IconIIcon :icon="icons.productInstallationStatusUnknown" :alt="props.text" />
      </span>
    </p-tag>
    <p-tag
      v-else-if="
        $mq == 'mobile' &&
        (props.text == 'not_installed' || props.text == '' || props.text == 'none')
      "
      data-testid="TCInstallationStatusBadge"
      severity="secondary"
    >
      <!-- transparent-->
      <span class="h6">
        {{ $mq == 'mobile' ? t_fixed('keep-english.empty') : '' }}
      </span>
    </p-tag>
    <div
      v-else-if="
        $mq != 'mobile' &&
        (props.text == 'not_installed' || props.text == '' || props.text == 'none')
      "
      data-testid="TCInstallationStatusBadge"
      severity="secondary"
    >
      <!-- transparent -->
    </div>
    <p-tag v-else data-testid="TCInstallationStatusBadge" :severity="props.variant">
      <!-- mixed -->
      <span class="h6"> {{ props.text }} </span>
    </p-tag>
  </div>
</template>

<script lang="ts" setup>
  import { useStrings } from '~/composables/mixins/useStrings'
  import type { PSeverity } from '~/types/LibComponentTypes'

  const icons = useIcons()
  const { t_fixed } = useStrings()
  const $mq = useMQ().$mq

  const props = defineProps({
    text: { type: String, default: '' },
    variant: {
      type: String as PropType<PSeverity>,
      default: 'warn',
    },
  })
</script>
