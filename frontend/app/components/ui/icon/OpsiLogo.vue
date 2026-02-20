<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <img
    v-if="useColorMode().value === 'light'"
    src="~assets/images/opsi.png"
    alt="opsiconfd Logo"
    class="inline h-12"
  />
  <img v-else src="~assets/images/opsi_dark.png" alt="opsiconfd Logo" class="inline h-12" />
  <!--<el-image
    data-testid="IconIOpsiLogo"
    :src="imageUrl"
    :alt="translatedLabel"
    :height="props.height"
    :class="{ opsilogo_white: props.white, [props.classes]: true }"
  >
    <template #placeholder>
      <div class="image-slot">
        {{ $t('OPSILogo') }}
      </div>
    </template>
    <template #error>
      <div class="image-slot">
        {{ $t('message.loadingFailed') }}
        {{ translatedLabel }}
      </div>
    </template>
  </el-image>
  -->
</template>

<script setup lang="ts">
  const $t = useI18n().t
  const config = useRuntimeConfig()
  const translatedLabel = ref($t('reloadOPSIWebGUI'))

  const props = defineProps({
    short: { type: Boolean, default: true },
    light: { type: Boolean, default: false },
    white: { type: Boolean, default: false },
    classes: { type: String, default: '' },
    height: { type: String, default: '' },
  })

  const imageUrl = computed(() => {
    const base = config.public.OWN_PATH + '/assets/images/'
    //const short = props.short ? 'Bildmarke_ohne_Text_quer' : 'Bildmarke_quer'
    // TODO: really needed short ?
    const dark = !props.light ? '_dark' : ''
    return `${base}opsi${dark}.png`
  })
</script>

<style>
  .opsilogo_white {
    filter: saturate(0) brightness(5) !important;
  }
</style>
