<script setup lang="ts">
  async function init() {}
  const supportItem = {
    title: 'supportPage.forum.title',
    description: 'supportPage.forum.description',
    buttonname: 'supportPage.forum.button',
    link: 'https://forum.opsi.org/index.php',
  }
</script>
<template>
  <Story :setup-app="init">
    <Variant title="mobile" :meta="{ wrapperMobile: true }" responsive-disabled>
      <CardCSupport :item="supportItem" />
    </Variant>
    <Variant title="desktop">
      <CardCSupport :item="supportItem" />
    </Variant>
  </Story>
</template>
