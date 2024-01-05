<template>
  <b-card class="text-center index-card">
    <h1 class="title">
      {{ $t("uib") }} <br>
      {{ $t("button.login") }} <br>
    </h1>

    <TestEPButton />
    <TestStore />
    <FormitemDDTheme />
    <br /> screen: {{  mq.$mq }}
    <TestI18n />

    <TestMixin />
    <IconILoading animation="cylon" />
    <TestFetch />
    <!-- <br /> isPreferredDark: {{  mq.isPreferredDark }} -->

      <!-- <IconELILoading animation="cylon" /> -->
  </b-card>
</template>

<script setup>
const mq = useMQ()
</script>

<style>
/* .theme-light {}
.theme-dark {
  background-color: rgb(56, 56, 56);
  color: blue;
} */
</style>
