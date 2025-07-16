<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div class="max-w-[500px] m-auto shadow-lg rounded-lg p-4">
    <div class="grid place-items-center gap-4">
      <IconIOpsiLogo :short="false" :light="storeSettings().isLight" class="h-50 max-w-[700px]" />
      <h2 class="text-center font-semibold">
        {{ t_fixed('title.project') }} {{ $config.public.packageVersion }}
      </h2>
      <IconIUibLogo :short="false" :light="storeSettings().isLight" class="mt-10 h-10" />
    </div>
  </div>
</template>

<script setup>
  import { useStrings } from '~/composables/mixins/useStrings'
  import { useMBus } from '~/composables/mixins/useMessagebus'
  import { useNotification } from '~/composables/mixins/useComponent'

  const { notifyError } = useNotification()
  const $config = useRuntimeConfig()
  const $t = useI18n().t
  const { t_fixed } = useStrings()

  useMBus(() => {}, false, $t)

  // TODO: close right menu on mount
</script>
