<template>
  <div class="max-w-[480px] index-card m-auto  ">
    <div class="grid place-items-center">

    <h1 class="title m-auto">
      {{ t_fixed("title.project") }} <br/>
    </h1>
    <!-- <h2 class="m-auto">
      OPSICONFD PORT {{ $config.public.OPSICONFD_PORT }}
    </h2> -->
    <IconIOpsiLogo
      :short="false"
      :light="storeSettings().isLight"
      classes="w-100 index-opsi-logo"
    />
    <IconIUibLogo
      :short="false"
      :light="storeSettings().isLight"
      classes="w-50 index-uib-logo "
      />
    <!--
    <TestEPButton />
    <FormitemDDTheme />
    <br /> screen: {{  mq.$mq }}
    <TestI18n />

    <TestMixin />
    <IconILoading animation="cylon" />
    <TestFetch /> -->
    <!-- <br /> isPreferredDark: {{  mq.isPreferredDark }} -->
    <!-- <IconELILoading animation="cylon" /> -->
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
  console.log('wsBusMsgObjectChanged', msg)
}
</script>

<style>
/* .theme-light {}
.theme-dark {
  background-color: rgb(56, 56, 56);
  color: blue;
} */
.index-card .index-opsi-logo {
  max-width: 700px;
}
.index-card .index-uib-logo {
  max-width: 400px;
}
.index-card .title {
  font-size: xx-large;
}
</style>
