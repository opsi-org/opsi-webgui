<template>
  <div class="dd_lang">
    <label for="language" class="sr-only"> Language </label>
    <!-- style="height:100%;margin:0px;" -->
    <b-nav-item-dropdown
      id="language"
      data-testid="DropdownDDLang"
      :text="$i18n.locale"
      alt="select theme"
      variant="primary"
      :dropup="dropup"
    >
      <b-dropdown-item
        v-for="(lang, i) in languages"
        :key="i"
        :data-testid="`DropdownDDLang-Item-${lang}`"
        @click="changeLanguage(lang)"
      >
        {{ lang }}
      </b-dropdown-item>
    </b-nav-item-dropdown>
  </div>
</template>

<script lang="ts">
import { Component, Prop, namespace, Vue } from 'nuxt-property-decorator'
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
    // if (!this.$i18n) {
    //   this.$i18n = { messages:['en'], locale:'en' }
    // }
    this.languages = Object.keys(this.$i18n.messages)
    // require.context('~/locale/', true, /\.json$/) as IObjectString2Any
    // langPaths.keys().forEach((key: string) => (this.languages.push((key as string).replace('./', '').replace('.json', ''))))
  }

  changeLanguage (lang : string) {
    this.setLanguage(lang)
    this.$i18n.locale = lang
  }
}
</script>

<style>
.dd_lang{
  margin-top: 3px;
  padding-left: 1em !important;
  padding-right: 1em !important;
  list-style: none;
}
/* .dd_lang a {
  color: inherit !important
} */
</style>
