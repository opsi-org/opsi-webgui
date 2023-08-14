<template>
  <b-dropdown
    v-if="navbar"
    data-testid="DropdownDDTheme"
    :aria-label="$t('form.theme')"
    variant="primary border-0"
    size="sm"
    class="global_topbar_button"
    no-caret
    :title="$t('button.theme.tooltip')"
  >
    <template #button-content>
      <b-icon v-if="themeicon" :icon="themeicon" />
      {{ ($mq=='mobile') ? theme.title :'' }}
    </template>
    <b-dropdown-item
      v-for="t in themes"
      :key="t.rel"
      :disable="t.title==theme.title"
      :class="{selected: t.title == theme.title}"
      @click="theme = t;"
    >
      <b-icon v-if="t.icon" :icon="t.icon" />
      {{ t.title }}
    </b-dropdown-item>
  </b-dropdown>

  <b-dropdown
    v-else
    data-testid="DropdownDDTheme"
    :text="theme.title"
    size="sm"
    variant="outline-primary"
    no-caret
    dropright
  >
    <template #button-content>
      <b-icon v-if="themeicon" :icon="themeicon" />
      {{ theme.title }}
    </template>
    <b-dropdown-item
      v-for="t in themes"
      :key="t.rel"
      :disable="t.title==theme.title"
      variant="transparent"
      @click="theme = t;"
    >
      <b-icon v-if="t.icon" :icon="t.icon" />
      {{ t.title }}
    </b-dropdown-item>
  </b-dropdown>
</template>

<script lang="ts">
import { Component, Prop, Vue, namespace } from 'nuxt-property-decorator'
import { ITheme } from '../../.utils/types/tsettings'
import { Icons } from '../../mixins/icons'
const settings = namespace('settings')

@Component({ mixins: [Icons] })
export default class DDTheme extends Vue {
  @Prop({ default: false }) navbar!: boolean
  icon: any
  $mq:any
  t: string = ''

  @settings.Getter public colortheme!: ITheme
  @settings.Mutation public setColorTheme!: (theme: ITheme) => void
  get theme () {
    return this.colortheme
  }

  set theme (val: ITheme) {
    this.setColorTheme(val)
  }

  get themeicon () {
    if (this.theme.title === 'light') {
      return this.themes[0].icon
    }
    return this.themes[1].icon
  }

  get themes () {
    return [
      // Created with https://bootstrap.build/app :
      // Used from https://bootswatch.com/ :
      { title: 'light', rel: 'themes/opsi-light.css', icon: this.icon.themelight },
      { title: 'dark', rel: 'themes/opsi-dark.css', icon: this.icon.themedark }
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
#theme .dropdown-toggle::after{
  display:none;
}

#theme .selected,
#theme .selected > a.dropdown-item,
#theme .selected:hover {
  color: var(--light) !important;
  background-color: var(--primary) !important;
}
#theme .selected > a.dropdown-item:hover {
  background-color: var(--primary-dark) !important;
}
</style>
