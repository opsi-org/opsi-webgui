<template>
  <div class="container-fluid">
    <span v-for="item in supportItems" :key="item.title">
      <CardCSupport :item="item" />
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class PageSupport extends Vue {
  supportItems: Array<object> = [
    {
      title: 'supportPage.documentation.title',
      description: 'supportPage.documentation.description',
      buttonname: 'supportPage.documentation.button',
      link: 'https://www.uib.de/en/opsi-documentation/documentation'
    },
    {
      title: 'supportPage.forum.title',
      description: 'supportPage.forum.description',
      buttonname: 'supportPage.forum.button',
      link: 'https://forum.opsi.org/index.php'
    },
    {
      title: 'supportPage.support.title',
      description: 'supportPage.support.description',
      buttonname: 'supportPage.support.button',
      link: 'https://www.uib.de/en/support-training/support'
    }
  ]
}
</script>
