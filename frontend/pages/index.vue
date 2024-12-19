<template>
  <div class="max-w-[500px] m-auto shadow-lg rounded-lg p-4">
    <div class="grid place-items-center gap-4">
      <IconIOpsiLogo
        :short="false"
        :light="storeSettings().isLight"
        class="h-50 max-w-[700px]"
      />
      <h2 class="text-center font-semibold">
        {{ t_fixed('title.project') }} {{ $config.public.packageVersion }}
      </h2>
      <IconIUibLogo
        :short="false"
        :light="storeSettings().isLight"
        class="mt-10 h-10"
      />
    </div>
  </div>
</template>

<script setup>
  import { useStrings } from '~/composables/mixins/useStrings'
  import { useMBus } from '~/composables/mixins/useMessagebus'

  const $config = useRuntimeConfig()
  const $t = useI18n().t
  const { t_fixed } = useStrings()

  useMBus(() => {}, false, $t)

  // TODO: close right menu on mount
</script>
