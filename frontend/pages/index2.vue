<template>

    <div class="">
    <h1 class="title">
      {{ $t("uib") }} <br>
      {{ $t("button.login") }} <br>
    </h1>
    <TestEPButton />
    <br>
    <FormitemDDTheme />
    <br> screen: {{  mq.$mq }}
    <TestI18n />
    <TestMixin />
    <IconILoading animation="cylon" />
    <TestFetch />
    If data visible login worked : {{ fetchResult }}
    <PopconfirmPLogout />
  </div>

</template>

<script setup>
import { useNotification } from '~/composables/mixins/useComponent';
const { notifyError } = useNotification()
const $t = useI18n().t
const mq = useMQ()
// user/configuration
const authStore = storeAuth()
const fetchResult = ref({});
onMounted( async () => {
  // const { data, error } = await useAPI('/user/configuration').get().json()
  const { data ,error } = await useApiGET('/user/configuration')
  if (error) {
    notifyError({ message: error?.response?.data?.message })
    return
  }
  fetchResult.value = data;
});
</script>

