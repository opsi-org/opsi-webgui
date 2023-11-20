<!-- Meow.story.vue -->
<template>
  <Story
    :layout="{ type: 'single', iframe: false }"
  >
    <Variant title="ElementPlus-Color">
      <el-button type="primary">TEST EL</el-button>
    </Variant>
    <Variant title="Bootstrap">
      <b-button variant="primary">TEST BT</b-button>
    </Variant>
    <Variant title="Logout">
      <ButtonBTNLogout />
    </Variant>
  </Story>
</template>

<script lang="ts" setup>
// import BTNLogout from './BTNLogout.vue'
</script>