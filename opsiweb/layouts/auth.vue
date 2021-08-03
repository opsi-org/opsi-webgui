<template>
  <div>
    <Nuxt />
    <BarBBottom />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
const settings = namespace('settings')

@Component
export default class LayoutAuth extends Vue {
  @settings.Getter public colortheme!: any
  head () {
    return {
      link: [{
        rel: 'stylesheet',
        href: (this.colortheme) ? this.colortheme.rel : ''
      }]
    }
  }
}
</script>
