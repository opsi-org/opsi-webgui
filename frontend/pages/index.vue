<template>
  <div class="max-w-[480px] m-auto shadow-lg rounded-lg">
    <div class="grid place-items-center">
      <IconIOpsiLogo
        :short="false"
        :light="storeSettings().isLight"
        class="w-full max-w-[700px]"
      />
      <h1 class="text-4xl m-auto">
        {{ t_fixed("title.project") }} <br>
      </h1>
      <IconIUibLogo
        :short="false"
        :light="storeSettings().isLight"
        class="mt-20 ml-auto h-10"
      />
    </div>
  </div>
</template>

<script setup>
import { useStrings } from '~/composables/mixins/useStrings';
import { useMBus } from '~/composables/mixins/useMessagebus';
const $config = useRuntimeConfig()
const mq = useMQ()
const $t = useI18n().t
const { t_fixed } = useStrings()

const msgbus = useMBus(wsBusMsgObjectChanged, false, $t)

function wsBusMsgObjectChanged(msg) {
  // console.log('wsBusMsgObjectChanged', msg)
}
</script>

