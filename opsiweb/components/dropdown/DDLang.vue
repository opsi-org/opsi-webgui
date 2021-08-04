<template>
  <div class="btn btn-secondary dd-theme text-left">
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
const settings = namespace('settings')

@Component export default class DDLang extends Vue {
  @Prop({ default: false }) dropup!: boolean

  languages: Array<string> = ['en', 'de']

  @settings.Getter public language!: string
  @settings.Mutation public setLanguage!: (lang: string) => void

  beforeMount () {
    if (this.language) {
      this.$i18n.locale = this.language
    }
  }

  changeLanguage (lang : string) {
    this.setLanguage(lang)
    this.$i18n.locale = lang
  }
}
</script>

<style>
/* .navbar-light .navbar-nav .nav-link{
  color: unset !important;
  font-weight: normal !important;
  padding-top: 0px;
  padding-bottom: 0px;
}
.dd-theme{
  padding-left: 1em !important;
  padding-right: 1em !important;
}
.dropdown:hover
.dropdown-toggle:hover
{
  background-image: unset !important;
  background-color: transparent !important;
} */
</style>
