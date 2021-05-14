<template>
  <b-dropdown :text="theme" variant="danger">
    <b-dropdown-item
      v-for="t in styles.themes"
      :key="t.rel"
      :disable="t.title==theme"
      @click="theme = t;"
    >
      {{ t.title }}
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'DropdownTheme',
  props: {
    // insideDropdown: { type: Boolean, default: false },
    // dropup: { type: Boolean, default: false},
    // dropright: { type: Boolean, default: false },
    // openOnHover: { type: Boolean, default: false },
    // size: { type: String, default: 'md' },
    // variant: { type: String, default: 'primary' },
  },
  data: () => ({
    styles: {
      themes: [
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
    }
  }),
  computed: {
    ...mapGetters({
      XgetColorTheme: 'settings/colortheme'
    }),
    theme: {
      get () {
        return this.XgetColorTheme.title
      },
      set (theme) {
        this.setTheme(theme)
      }
    }
  },
  methods: {
    ...mapMutations({
      XsetColorTheme: 'settings/setColorTheme'
    }),
    setTheme (theme) {
      this.XsetColorTheme(theme)
    }
  }
}
</script>

<style>
</style>
