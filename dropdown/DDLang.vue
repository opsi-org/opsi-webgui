<template>
  <div class="btn btn-primary dd_lang text-left">
    <b-nav-item-dropdown
      style="height:100%;margin:0px;"
      :text="$i18n.locale"
      alt="select theme"
      :dropup="dropup"
    >
      <b-dropdown-item
        v-for="(lang, i) in languages"
        :key="i"
        @click="changeLanguage(lang)"
      >
        {{ lang }}
      </b-dropdown-item>
    </b-nav-item-dropdown>
  </div>
</template>

<script lang="ts">
import { Component, Prop, namespace, Vue } from 'nuxt-property-decorator'
import { IObjectString2Any } from '~/types/tsettings'
const settings = namespace('settings')

@Component export default class DDLang extends Vue {
  @Prop({ default: false }) dropup!: boolean

  languages: Array<string> = []

  @settings.Getter public language!: string
  @settings.Mutation public setLanguage!: (lang: string) => void

  beforeMount () {
    if (this.language) {
      this.$i18n.locale = this.language
    }
  }

  mounted () {
    const langPaths = require.context('~/locale/', true, /\.json$/) as IObjectString2Any
    langPaths.keys().forEach((key: string) => (this.languages.push((key as string).replace('./', '').replace('.json', ''))))
  }

  changeLanguage (lang : string) {
    this.setLanguage(lang)
    this.$i18n.locale = lang
    window.location.reload()
    // this.$bvToast.toast(this.$t('message.reloadMessage') as string, {
    //   title: this.$t('message.hint') as string,
    //   toaster: 'b-toaster-bottom-right',
    //   variant: 'info',
    //   autoHideDelay: 5000,
    //   appendToast: false
    // })
  }
}
</script>

<style>
.dd_lang{
  /* max-height: max-c; */
  padding-left: 1em !important;
  padding-right: 1em !important;
}
/* .dropdown:hover
.dropdown-toggle:hover
{
  background-image: unset !important;
  background-color: transparent !important;
} */
</style>
