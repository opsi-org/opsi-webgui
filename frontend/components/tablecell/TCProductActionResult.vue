<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div data-testid="TCActionResult">
    <IconIDetails
      v-if="props.text == MIXED"
      :content="icon.unequal"
      :variant="props.variant"
      data-testid="TCActionResultDetailsMixed"
      content-is-icon
    />
    <!--<p-tag v-if="props.text == MIXED" data-testid="TCActionResultBadge" :severity="props.variant">
      <IconIIcon :icon="icon.unequal" alt="mixed" />
    </p-tag>-->
    <IconIDetails
      v-else-if="props.text == 'successful'"
      :content="icon.productActionResultSuccessful"
      variant="success"
      data-testid="TCActionResultDetailsSuccessful"
      content-is-icon
    />
    <!--<p-tag
      v-else-if="props.text == 'successful'"
      data-testid="TCActionResultBadge"
      severity="success"
    >
      <span class="h6">
        <IconIIcon :icon="icon.productActionResultSuccessful" alt="successful" />
      </span>
    </p-tag>-->
    <!--<p-tag v-else-if="props.text == 'failed'" data-testid="TCActionResultBadge" severity="danger">
      <span class="h6"> <IconIIcon :icon="icon.x" alt="failed" /> </span>
    </p-tag>-->
    <IconIDetails
      v-else-if="props.text == 'failed'"
      :content="icon.x"
      variant="danger"
      data-testid="TCActionResultDetailsFailed"
      content-is-icon
    />
    <div
      v-else-if="
        $mq == 'mobile' &&
        (props.text == 'not_installed' || props.text == '' || props.text == 'none')
      "
      data-testid="TCActionResultBadge"
      severity="secondary"
    >
      <span class="h6">
        {{ $mq == 'mobile' ? t_fixed('keep-english.empty') : '' }}
      </span>
    </div>
    <div
      v-else-if="
        $mq != 'mobile' &&
        (props.text == 'not_installed' || props.text == '' || props.text == 'none')
      "
      data-testid="TCActionResultBadge"
      severity="secondary"
    />
    <p-tag v-else data-testid="TCActionResultBadge" :type="props.variant">
      <span class="h6"> {{ props.text }} </span>
    </p-tag>
  </div>
</template>

<script lang="ts" setup>
  import { useStrings } from '~/composables/mixins/useStrings'
  import type { PSeverity } from '~/types/LibComponentTypes'

  const icon = useIcons()
  const t_fixed = useStrings().t_fixed
  const $mq = useMQ().$mq
  const $t = useI18n().t
  const MIXED = $t('mixed')

  const props = defineProps({
    text: { type: String, default: '' },
    variant: { type: String as PropType<PSeverity>, default: 'warn' },
  })
</script>
