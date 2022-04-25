<template>
  <!-- class="btn btn-primary dd_theme text-left" -->
  <div data-testid="DropdownDDTheme">
    <label for="theme" class="sr-only"> {{ $t('settingsPage.theme') }} </label>
    <!-- style="height:100%;margin:0px;max-width:150px;" -->
    <b-nav-item-dropdown
      v-if="navbar"
      id="theme"
      class="dd_theme"
      variant="primary"
      :text="theme.title"
      alt="select theme"
      :dropup="dropup"
    >
      <template #button-content="">
        <b-icon v-if="theme.icon" :icon="theme.icon" />
      </template>
      <b-dropdown-item
        v-for="t in themes"
        :key="t.rel"
        :disable="t.title==theme"
        @click="theme = t;"
      >
        <b-icon v-if="t.icon" :icon="t.icon" />
        {{ t.title }}
      </b-dropdown-item>
    </b-nav-item-dropdown>
    <b-dropdown
      v-else
      :text="theme.title"
      size="sm"
      style="width:200px;"
      variant="outline-primary"
      :dropup="dropup"
    >
      <template #button-content="">
        <b-icon v-if="theme.icon" :icon="theme.icon" />
        {{ theme.title }}
      </template>
      <b-dropdown-item
        v-for="t in themes"
        :key="t.rel"
        :disable="t.title==theme"
        variant="transparent"
        @click="theme = t;"
      >
        <b-icon v-if="t.icon" :icon="t.icon" />
        {{ t.title }}
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, namespace } from 'nuxt-property-decorator'
import { ITheme } from '../../.utils/types/tsettings'
import { Constants } from '../../mixins/uib-mixins'
const settings = namespace('settings')

@Component({ mixins: [Constants] })
export default class DDTheme extends Vue {
  iconnames: any
  @Prop({ default: false }) dropup!: boolean
  @Prop({ default: false }) navbar!: boolean
  t: string = ''

  @settings.Getter public colortheme!: ITheme
  @settings.Mutation public setColorTheme!: (theme: ITheme) => void
  get theme () {
    return this.colortheme
  }

  set theme (val: ITheme) {
    this.setColorTheme(val)
  }

  get themes () {
    return [
      // Created with https://bootstrap.build/app :
      // Used from https://bootswatch.com/ :
      { title: 'light', rel: 'themes/opsi-light.css', icon: this.iconnames.themelight },
      { title: 'dark', rel: 'themes/opsi-dark.css', icon: this.iconnames.themedark }
      // ,
      // { title: 'Bootswatch-Cerulean', rel: '//netdna.bootstrapcdn.com/bootswatch/3.0.0/cerulean/bootstrap.min.css' },
      // { title: 'Bootswatch-Cosmo', rel: '//netdna.bootstrapcdn.com/bootswatch/3.0.0/cosmo/bootstrap.min.css' },
      // { title: 'Bootswatch-Lumen', rel: 'https://bootswatch.com/3/lumen/bootstrap.min.css' },
      // { title: 'Bootswatch-Cyborg', rel: '//netdna.bootstrapcdn.com/bootswatch/3.0.0/cyborg/bootstrap.min.css' },
      // { title: 'Bootswatch-Solar', rel: '//stackpath.bootstrapcdn.com/bootswatch/4.5.2/solar/bootstrap.min.css' },
      // { title: 'Bootswatch-Yeti', rel: '//stackpath.bootstrapcdn.com/bootswatch/4.5.2/yeti/bootstrap.min.css' },
      // { title: 'Bootswatch-Slate', rel: 'https://stackpath.bootstrapcdn.com/bootswatch/4.5.2/slate/bootstrap.min.css' },
      // { title: 'Bootswatch-Sketchy', rel: 'https://stackpath.bootstrapcdn.com/bootswatch/4.5.2/sketchy/bootstrap.min.css' },
      // { title: 'Bootswatch-Lux', rel: 'https://stackpath.bootstrapcdn.com/bootswatch/4.5.2/lux/bootstrap.min.css' },
      // { title: 'opsi-dark', rel: 'themes/opsi-bootstrap-theme-dark.css' },
      // { title: 'opsi-dark-inversed', rel: 'themes/opsi-bootstrap-theme-dark-inversed.css' },
      // { title: 'opsi-light', rel: 'themes/opsi-bootstrap-theme-light.css' },
      // { title: 'opsi-light-inversed', rel: 'themes/opsi-bootstrap-theme-light-inversed.css' }
    ]
  }
}
</script>

<style>
.dd_theme{
  margin-top: 3px;
  padding-left: 1em !important;
  padding-right: 1em !important;
}
</style>
