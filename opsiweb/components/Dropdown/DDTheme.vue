<template>
  <b-dropdown :text="theme.title" variant="secondary">
    <b-dropdown-item
      v-for="t in themes"
      :key="t.rel"
      :disable="t.title==theme"
      @click="theme = t;"
    >
      {{ t.title }}
    </b-dropdown-item>
  </b-dropdown>
</template>

<script lang="ts">
import { Component, Vue, namespace } from 'nuxt-property-decorator'
const settings = namespace('settings')
interface OBJTheme {
    title: string,
    rel: string
}

@Component export default class DDTheme extends Vue {
  themes: Array<OBJTheme> = [
    // Created with https://bootstrap.build/app :
    // {title: "opsi-dark", rel:"~/assets/themes/theme-opsi-color-dark.css"},
    // {title: "opsi-light", rel:"~/assets/themes/theme-opsi-color-light.css"},
    // Used from https://bootswatch.com/ :
    { title: 'Bootswatch-Cerulean', rel: '//netdna.bootstrapcdn.com/bootswatch/3.0.0/cerulean/bootstrap.min.css' },
    { title: 'Bootswatch-Cosmo', rel: '//netdna.bootstrapcdn.com/bootswatch/3.0.0/cosmo/bootstrap.min.css' },
    { title: 'Bootswatch-Lumen', rel: '~/assets/theme-bootswatch-lumen.css' },
    { title: 'Bootswatch-Cyborg', rel: '//netdna.bootstrapcdn.com/bootswatch/3.0.0/cyborg/bootstrap.min.css' },
    { title: 'Bootswatch-Solar', rel: '//stackpath.bootstrapcdn.com/bootswatch/4.5.2/solar/bootstrap.min.css' },
    { title: 'Bootswatch-Yeti', rel: '//stackpath.bootstrapcdn.com/bootswatch/4.5.2/yeti/bootstrap.min.css' },
    { title: 'Bootswatch-Slate', rel: 'https://stackpath.bootstrapcdn.com/bootswatch/4.5.2/slate/bootstrap.min.css' },
    { title: 'Bootswatch-Sketchy', rel: 'https://stackpath.bootstrapcdn.com/bootswatch/4.5.2/sketchy/bootstrap.min.css' },
    { title: 'Bootswatch-Lux', rel: 'https://stackpath.bootstrapcdn.com/bootswatch/4.5.2/lux/bootstrap.min.css' }
  ]

  @settings.Getter public colortheme!: OBJTheme
  @settings.Mutation public setColorTheme!: (theme: OBJTheme) => void
  get theme () {
    return this.colortheme
  }

  set theme (val: OBJTheme) {
    this.setColorTheme(val)
  }
}
</script>

<style>
</style>
