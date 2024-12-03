<template>
  <div class="max-w-[500px] m-auto shadow-lg rounded-lg">
    <div class="grid place-items-center">
      <h1>
        {{ t_fixed('title.project') }}
      </h1>
      <h2>
        {{
          $t('title.field.version', { version: $config.public.packageVersion })
        }}
      </h2>
      <IconIOpsiLogo
        :short="false"
        :light="storeSettings().isLight"
        class="w-full max-w-[700px]"
      />
      <IconIUibLogo
        :short="false"
        :light="storeSettings().isLight"
        class="mt-10 ml-auto h-20 m-auto"
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
