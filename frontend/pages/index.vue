<template>
  <!-- <b-card class="text-center index-card"> -->
  <el-card style="max-width: 480px">
    <h1 class="title">
      {{ $t("uib") }} <br>
      {{ $t("button.login") }} <br>
    </h1>

    <TestEPButton />
    <FormitemDDTheme />
    <br /> screen: {{  mq.$mq }}
    <TestI18n />

    <TestMixin />
    <IconILoading animation="cylon" />
    <TestFetch />
    <!-- <br /> isPreferredDark: {{  mq.isPreferredDark }} -->

      <!-- <IconELILoading animation="cylon" /> -->
  </el-card>
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
