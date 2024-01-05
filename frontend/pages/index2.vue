<template>
  <!-- <b-card class="text-center index-card"> -->
    <div class="">
    <h1 class="title">
      {{ $t("uib") }} <br>
      {{ $t("button.login") }} <br>
    </h1>

    <TestEPButton />
    <br />
    <TestStore />
    <DropdownDDTheme />
    <br /> screen: {{  mq.$mq }}
    <TestI18n />

    <TestMixin />
    <IconILoading animation="cylon" />
    <TestFetch />
    If data visible login worked : {{ fetchResult }}
    <!-- <br /> isPreferredDark: {{  mq.isPreferredDark }} -->

    <!-- <IconELILoading animation="cylon" /> -->

    <ButtonBTNLogout />
  </div>
  <!-- </b-card> -->
</template>

<script setup>
import { useNotification } from '~/composables/mixins/useComponent';

const mq = useMQ()
// user/configuration
const authStore = storeAuth()
const fetchResult = ref({});
onMounted( async () => {
  // const { data, error } = await useAPI('/user/configuration').get().json()
  const { data ,error } = await useApiGET('/user/configuration')
  if (error) {
    useNotification().error(error)
    return
  }
  fetchResult.value = data;
});
</script>

<style>
</style>
