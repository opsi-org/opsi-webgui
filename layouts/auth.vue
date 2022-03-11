<template>
  <div>
    <Nuxt />
    <BarBAuthFooter class="footer_content" />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
const settings = namespace('settings')

@Component
export default class LayoutAuth extends Vue {
  @settings.Getter public colortheme!: any
  @settings.Getter public language!: string

  beforeMount () {
    if (this.language) {
      this.$i18n.locale = this.language
    }
  }

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
<style>
.topbar_content,
.sidebar_content ,
.footer_content {
  color: var(--light) !important;
}
</style>
