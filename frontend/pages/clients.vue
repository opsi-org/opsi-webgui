<template>
  <b-card class="text-center index-card">
    <h1 class="title">
      {{ $t("uib") }} <br>
      {{ $t("button.login") }} <br>
    </h1>

    <TestEPButton />
    <TestStore />
    <TestTheme />
    <br /> screen: {{  mq.$mq }}
    <TestI18n />

    <TestMixin />
    <IconILoading animation="cylon" />
    <TestFetch />
    If data visible login worked : {{ fetchResult }}
    <!-- <br /> isPreferredDark: {{  mq.isPreferredDark }} -->

      <!-- <IconELILoading animation="cylon" /> -->
      <ButtonBTNLogout />
  </b-card>
</template>

<script setup>
const mq = useMQ()
// user/configuration
const authStore = storeAuth()
const fetchResult = ref({});
onMounted( async () => {
  // const { data, error } = await useAPI('/user/configuration').get().json()
  const { data ,error } = await useApiGET('/user/configuration')
  if (error) {
    notificationError(error)
    return
  }
  fetchResult.value = data;
});
</script>

<style>
</style>
