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
      title: 'Documentation',
      description: 'Our documentation contains Getiing Started Guides and Manuals, which are step-by-step instructions that will help you get started with OPSI.',
      buttonname: 'View Documentation',
      link: 'https://www.uib.de/en/opsi-documentation/documentation'
    },
    {
      title: 'Forum',
      description: 'Share feedback, ask for help and connect with community on the OPSI Forum.',
      buttonname: 'Visit OPSI Forum',
      link: 'https://forum.opsi.org/index.php'
    },
    {
      title: 'Support',
      description: 'Do you need support at OPSI? We will get you the help you need.',
      buttonname: 'Learn More',
      link: 'https://www.uib.de/en/support-training/support'
    }
  ]
}
</script>
