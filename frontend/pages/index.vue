<template>
  <div>
    <b-card class="text-center index-card">
    <h1 class="title">
      {{ $t("uib") }} <br>
      {{ $t("button.login") }} <br>
    </h1>

    </b-card>
    <TestEPButton />
    <TestStore />
    <TestTheme />
    <!--
      <TestI18n />
    <TestMixin />
    <IconILoading animation="cylon" /> -->
      <!-- <IconELILoading animation="cylon" /> -->
  </div>
</template>

<script setup>
</script>

<style>
/* .theme-light {}
.theme-dark {
  background-color: rgb(56, 56, 56);
  color: blue;
} */
</style>
