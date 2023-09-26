<template>
  <b-card class="text-center index-card">
    <div>
      <h1 class="title">
        {{ $t("uib") }} <br>
        Login <br />
        <!-- Locale {{ locale }} -->
      </h1>

    </div>
    <TestTheme />
    <TestI18n />
    <TestStore />
    <TestMixin />
    <TestEditor />
    <!--
    -->

    <!-- <IconIOpsiLogo
      :short="false"
      :light="themeclass === CONST_LIGHT"
      classes="w-100 index-opsi-logo"
    />
    <IconIUibLogo
      :short="false"
      :light="themeclass === CONST_LIGHT"
      classes="w-50 index-uib-logo"
    /> -->
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
.index-card {
  min-height: 600px;
  background-color: inherit;
  color: inherit;
}
</style>
