<template>
  <div :class="themeclass">
    <AlertAAlert ref="authAlert" data-testid="authAlert" />
    <Nuxt />
    <BarBAuthFooter v-once class="footer_content" />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { Settings } from '../mixins/settings'
const settings = namespace('settings')

@Component({ mixins: [Settings] })
export default class LayoutAuth extends Vue {
  $i18n: any
  themeclass!: string
  CONST_LIGHT!: string
  @settings.Getter public language!: string

  beforeMount () {
    if (this.language) {
      this.$i18n.locale = this.language
    }
  }

  head () {
    return {
      link: [
        // // { rel: 'stylesheet', href: (this.colortheme) ? this.colortheme.rel : '' },
        // { rel: 'stylesheet', href: (this.colortheme) ? '/themes/opsi-dark.css' : '' },
        // { rel: 'stylesheet', href: 'css/custom.css' },
        // { rel: 'stylesheet', href: (this.colortheme && this.colortheme.title === 'light') ? 'css/colors-light.css' : 'css/colors-dark.css' },
        // { rel: 'stylesheet', href: 'fonts/montserrat-alt1/fonts/webfonts/Montserrat-Alt1.css' },
        // { rel: 'stylesheet', href: 'fonts/montserrat-alt1/fonts/webfonts/Montserrat-Alt1.css' },

        // { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Montserrat:400,500,800' },
        // { rel: 'preload', as: 'font', type: 'css', href: '/fonts/montserrat-alt1/fonts/webfonts/Montserrat-Alt1.css' },
        { rel: 'stylesheet', href: (this.themeclass) ? 'themes/opsi.css' : '' },
        { rel: 'stylesheet', href: 'css/colors-all.css' },
        { rel: 'stylesheet', href: 'css/custom.css' },
        { rel: 'stylesheet', href: (this.themeclass === this.CONST_LIGHT) ? 'css/colors-light.css' : 'css/colors-dark.css' }
      ]

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
