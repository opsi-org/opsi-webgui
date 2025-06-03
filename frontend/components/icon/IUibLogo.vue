<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-image
    data-testid="IconIUibLogo"
    :src="imageUrl"
    :alt="translatedLabel"
    :height="props.height"
    :class="{ opsilogo_white: props.white !== false, [props.classes]: true }"
  >
    <template #placeholder>
      <div class="image-slot">
        {{ $t('loading.image.opsilogo') }}
      </div>
    </template>
    <template #error>
      <div class="image-slot">
        {{ $t('loading.image.error') }}
        {{ translatedLabel }}
      </div>
    </template>
  </el-image>
</template>

<script setup lang="ts">
  const $t = useI18n().t
  const config = useRuntimeConfig()
  const translatedLabel = ref($t('button.reload.app'))

  const props = defineProps({
    short: { type: Boolean, default: true },
    light: { type: Boolean, default: false },
    white: { type: Boolean, default: false },
    classes: { type: String, default: '' },
    height: { type: String, default: '' },
  })

  const imageUrl = computed<string>({
    get: () => {
      if (props.short && props.light)
        return config.public.OWN_PATH + '/images/UIB_1704_2023_UIB_Schriftzug_quer.png'
      if (props.short && !props.light)
        return config.public.OWN_PATH + '/images/UIB_1704_2023_UIB_Schriftzug_quer_neg.png'
      if (!props.short && props.light)
        return config.public.OWN_PATH + '/images/UIB_1704_2023_UIB_Logo_quer.png'
      if (!props.short && !props.light)
        return config.public.OWN_PATH + '/images/UIB_1704_2023_UIB_Logo_quer_neg.png'
      return ''
    },
    set: (_v) => {},
  })
</script>
