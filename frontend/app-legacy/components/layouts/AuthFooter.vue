<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <UFooter
    class="bg-opsi-blue text-white max-h-10 flex justify-between p-4"
    data-testid="BAuthFooter"
  >
    <div class="flex items-center">
      <UText>{{ staticStrings.t_fixed('uib') }}</UText>
    </div>
    <div class="flex justify-center items-center space-x-2">
      <SwitchSTheme class="mt-1" />
      <DropdownDDLang :footer="true" />
    </div>
    <div class="flex justify-end space-x-1">
      <UText>{{ $t('version') }}</UText>
      <UText class="BAuthFooter-version">{{ $config.public.packageVersion }}</UText>
    </div>
  </UFooter>
</template>

<script setup lang="ts">
  import { useStrings } from '@/composables/mixins/useStrings'
  const staticStrings = useStrings()
  const $config = useRuntimeConfig()
  const $t = useI18n().t
  useMQ()
</script>