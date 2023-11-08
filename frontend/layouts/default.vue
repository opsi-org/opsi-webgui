
<template>
  <div :class="'webgui-theme-'+color">
    Some default structure shared across all pages. Current theme: {{ settings.theme }}
    <BarBSide class="sidebar_content" />
    <div class="main_content">
      <slot />
    </div>

    after slot
  </div>
</template>

<script setup>
const settings = storeSettings()
const color = useColorMode();
</script>

<style>
.main_content{
  position:absolute;
  margin-top: var(--margin-top-maincontent);
  margin-left: var(--margin-left-maincontent);
  overflow-x: auto;
  overflow-y: hidden;
  width: calc(100% - 2 * var(--margin-left-maincontent));
  min-height: -webkit-fill-available;
}
</style>