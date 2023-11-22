<template>
  <b-dropdown
    id="quicksettingsDD"
    data-testid="DropdownDDLang"
    :aria-label="$t('button.lang.tooltip')"
    :title="$t('button.lang.tooltip')"
    :variant="footer? 'primary border-0' : 'outline-primary'"
    size="sm"
    :dropup="footer"
  >
    <template #button-content>
      <span style="text-transform:uppercase;"> <IconIIcon :icon="icon.language" /> {{ language }} </span>
    </template>
    <b-dropdown-item
      v-for="(lang, i) in languages"
      :key="i"
      :class="{ selected: lang==language }"
      :data-testid="`DropdownDDLang-Item-${lang}`"
      @click="changeLanguage(lang)"
    >
      <span style="text-transform:uppercase;"> {{ lang }} </span>
      <span>{{ (['en', 'de', 'fr'].includes(lang)) ? '': $t('button.lang.community-created') }}</span>
    </b-dropdown-item>
    <b-dropdown-item
      :data-testid="`DropdownDDLang-Item-contribute`"
      :title="$t('button.contribute-transifex.tooltip')"
      href="https://app.transifex.com/opsi-org/opsiorg/opsi-webguijson/"
      target="_blank"
      >
      <!-- href="https://explore.transifex.com/opsi-org/opsiorg/" -->
      <span> {{ $t('button.contribute-transifex') }} </span>
    </b-dropdown-item>
  </b-dropdown>
</template>

<script lang="ts">
import { Component, Prop, namespace, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
import { SettingsLanguage } from '../../mixins/settings'

@Component({ mixins: [Icons, SettingsLanguage] })
export default class DDLang extends Vue {
  language!:string // mixin
  setLanguage!:any // mixin

  icon:any
  $i18n:any
  $mq:any
  $t:any

  @Prop({ default: false }) footer!: boolean

  languages: Array<string> = []

  mounted () {
    this.languages = Object.keys(this.$i18n.messages)
  }

  changeLanguage (lang : string) {
    this.setLanguage(lang)
    this.$i18n.locale = lang
  }
}
</script>
