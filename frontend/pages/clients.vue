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
  </b-card>
</template>

<script setup>
const mq = useMQ()
// user/configuration

const fetchResult = ref({});
onMounted( async () => {
  const { data } = await useAPI('/user/configuration').get().json()
  fetchResult.value = data;
});
</script>

<style>
/* .theme-light {}
.theme-dark {
  background-color: rgb(56, 56, 56);
  color: blue;
} */
</style>
