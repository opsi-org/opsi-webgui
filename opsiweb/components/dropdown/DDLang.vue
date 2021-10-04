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
import { IObjectString2Any } from '~/scripts/types/tgeneral'
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
  }
}
</script>

<style>
.dd_lang{
  padding-left: 1em !important;
  padding-right: 1em !important;
}
</style>
