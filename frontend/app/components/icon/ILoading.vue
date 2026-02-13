<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div
    data-testid="ILoading"
    class="ILoading container-fluid"
    :style="'color:(--color, ' + props.color + ') !important;'"
    :class="{ inline: props.inline }"
  >
    <span v-if="!props.small" class="text-small" :class="{ inline: props.inline }">
      {{ $t('message.loading') }}
    </span>
    <IconIIcon
      :icon="icon.loading"
      :title="$t('message.loading')"
      :class="{
        'loading-icon': true,
        inline: props.inline,
      }"
    />
  </div>
</template>

<script setup lang="ts">
  const $t = useI18n().t
  const icon = useIcons()

  const props = defineProps({
    small: { type: Boolean, default: false },
    animation: { type: String, default: 'cylon' },
    color: { type: String, default: 'black' },
    inline: { type: Boolean, default: false },
  })
</script>

<style scoped>
  .ILoading {
    max-width: fit-content;
  }
</style>
