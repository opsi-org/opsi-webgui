<template>
  <div class="btn btn-secondary dd-theme text-left">
    <b-nav-item-dropdown
      v-if="navbar"
      style="height:100%;margin:0px;"
      variant="secondary"
      class="dd-dd-theme"
      :text="theme.title"
      alt="select theme"
    >
      <b-dropdown-item
        v-for="t in themes"
        :key="t.rel"
        :disable="t.title==theme"
        @click="theme = t;"
      >
        {{ t.title }}
      </b-dropdown-item>
    </b-nav-item-dropdown>
    <b-dropdown v-else :text="theme.title" variant="secondary">
      <b-dropdown-item
        v-for="t in themes"
        :key="t.rel"
        :disable="t.title==theme"
        @click="theme = t;"
      >
        {{ t.title }}
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, namespace } from 'nuxt-property-decorator'
import { ITheme } from '~/types/tsettings'
const settings = namespace('settings')

@Component export default class DDTheme extends Vue {
  @Prop({ default: false }) navbar!: boolean
  themes: Array<ITheme> = [
    // Created with https://bootstrap.build/app :
    // {title: "opsi-dark", rel:"~/assets/themes/theme-opsi-color-dark.css"},
    // {title: "opsi-light", rel:"~/assets/themes/theme-opsi-color-light.css"},
    // Used from https://bootswatch.com/ :
    { title: 'Bootswatch-Cerulean', rel: '//netdna.bootstrapcdn.com/bootswatch/3.0.0/cerulean/bootstrap.min.css' },
    { title: 'Bootswatch-Cosmo', rel: '//netdna.bootstrapcdn.com/bootswatch/3.0.0/cosmo/bootstrap.min.css' },
    { title: 'Bootswatch-Lumen', rel: 'https://bootswatch.com/3/lumen/bootstrap.min.css' },
    { title: 'Bootswatch-Cyborg', rel: '//netdna.bootstrapcdn.com/bootswatch/3.0.0/cyborg/bootstrap.min.css' },
    { title: 'Bootswatch-Solar', rel: '//stackpath.bootstrapcdn.com/bootswatch/4.5.2/solar/bootstrap.min.css' },
    { title: 'Bootswatch-Yeti', rel: '//stackpath.bootstrapcdn.com/bootswatch/4.5.2/yeti/bootstrap.min.css' },
    { title: 'Bootswatch-Slate', rel: 'https://stackpath.bootstrapcdn.com/bootswatch/4.5.2/slate/bootstrap.min.css' },
    { title: 'Bootswatch-Sketchy', rel: 'https://stackpath.bootstrapcdn.com/bootswatch/4.5.2/sketchy/bootstrap.min.css' },
    { title: 'Bootswatch-Lux', rel: 'https://stackpath.bootstrapcdn.com/bootswatch/4.5.2/lux/bootstrap.min.css' }
  ]

  @settings.Getter public colortheme!: ITheme
  @settings.Mutation public setColorTheme!: (theme: ITheme) => void
  get theme () {
    return this.colortheme
  }

  set theme (val: ITheme) {
    this.setColorTheme(val)
  }
}
</script>

<style>
.navbar-light .navbar-nav .nav-link{
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
}
</style>
