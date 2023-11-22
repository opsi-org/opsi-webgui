<template>
  <Story
    :layout="{ type: 'grid' }"
  >
    <Variant title="OpsiLogo-default">
      <IconIOpsiLogo />
    </Variant>
    <Variant title="OpsiLogo-short">
      <IconIOpsiLogo :short="true" />
    </Variant>
    <Variant title="OpsiLogo-not-short">
      <IconIOpsiLogo :short="false" />
    </Variant>
    <Variant title="OpsiLogo-light">
      <IconIOpsiLogo :light="true" />
    </Variant>
    <Variant title="OpsiLogo-white">
      <IconIOpsiLogo :white="true" />
    </Variant>
  </Story>
</template>

<script lang="ts" setup>
// import BTNLogout from './BTNLogout.vue'
</script>