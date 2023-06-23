<template>
  <b-dropdown
    id="language"
    data-testid="DropdownDDLang"
    :aria-label="$t('button.lang.tooltip')"
    :title="$t('button.lang.tooltip')"
    variant="primary border-0"
    class="global_topbar_button"
    size="sm"
    :dropup="dropup"
  >
    <template #button-content>
      <span style="text-transform:uppercase;"> <b-icon :icon="icon.language" /> {{ language }} </span>
    </template>
    <b-dropdown-item
      v-for="(lang, i) in languages"
      :key="i"
      :class="{ selected: lang==language }"
      :data-testid="`DropdownDDLang-Item-${lang}`"
      @click="changeLanguage(lang)"
    >
      <span style="text-transform:uppercase;"> {{ lang }} </span>
    </b-dropdown-item>
  </b-dropdown>
</template>

<script lang="ts">
import { Component, Prop, namespace, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
const settings = namespace('settings')

@Component({ mixins: [Icons] })
export default class DDLang extends Vue {
  icon:any
  $i18n:any
  $mq:any

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
    this.languages = Object.keys(this.$i18n.messages)
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
#language .selected,
#language .selected > a.dropdown-item,
#language .selected:hover {
  color: var(--light) !important;
  background-color: var(--primary) !important;
}
#language .selected > a.dropdown-item:hover {
  background-color: var(--primary-dark) !important;
}
</style>
