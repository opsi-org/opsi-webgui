<template>
  <b-card class="text-center index-card">
    <div>
      <h1 class="title">
        {{ $t("uib") }} <br>
        {{ $t("button.login") }} <br>
        <!-- Locale {{ locale }} -->
      </h1>

    </div>
    <TestTheme />
    <TestI18n />
    <TestStore />
    <TestMixin />
    <IconILoading animation="cylon" />
    <!-- <IconELILoading animation="cylon" /> -->
  </b-card>
</template>

<script setup>
</script>

<style>
.theme-light {}
.theme-dark {
  background-color: rgb(56, 56, 56);
  color: blue;
}
</style>
