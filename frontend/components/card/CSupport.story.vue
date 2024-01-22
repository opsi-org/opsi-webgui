<script setup lang="ts">
// import { useConfigserver } from '~/composables/mixins/useGet';
// import { loginlogout } from '~/histoire/histoire-utils';
// const store = ref<any>({ selectionDepots: [] })
async function init(data: any) {
  // await loginlogout(data)
  // await useConfigserver(true, store)
}
const supportItem = {
    title: 'supportPage.forum.title',
    description: 'supportPage.forum.description',
    buttonname: 'supportPage.forum.button',
    link: 'https://forum.opsi.org/index.php'
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
