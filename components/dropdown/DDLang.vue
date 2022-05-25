<template>
  <div>
    <label for="language" class="sr-only"> Language </label>
    <b-nav-item-dropdown
      id="language"
      data-testid="DropdownDDLang"
      :text="$i18n.locale"
      alt="select theme"
      :title="$t('button.lang.tooltip')"
      class="px-2 btn btn-primary btn-md w-100 text-left"
      variant="primary"
      :dropup="dropup"
    >
      <template #button-content="">
        <b-icon :icon="iconnames.language" />
        {{ ($mq!=='desktop')? '   ' + language :'' }}
      </template>
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
import { Constants } from '../../mixins/uib-mixins'
const settings = namespace('settings')

@Component({ mixins: [Constants] })
export default class DDLang extends Vue {
  iconnames:any

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

#language .dropdown-toggle::after{
  display:none;
}
</style>
