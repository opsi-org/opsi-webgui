<template>
  <div>
    <b-nav-item-dropdown :text="theme"
      v-if="insideDropdown"
      variant="light"
      class="bg-primary"
      :size="size"
      :dropright="dropright"
    >
      <b-dropdown-item
        class="text-secondary"
        v-for="t in styles.themes" :key="t.rel"
        :disable="t.title==theme"
        @click="theme = t;"
      >{{t.title}}</b-dropdown-item>
    </b-nav-item-dropdown>
    <b-dropdown v-else :size="size" :variant="variant" :dropup="dropup" :dropright="dropright">
      <template #button-content>{{theme}}</template>
      <b-dropdown-item bg-variant="danger"
        v-for="t in styles.themes" :key="t.rel"
        :disable="t.title==theme"
        @click="theme = t;"
      >{{t.title}}</b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";

export default {
  name: "Dropdown-Theme",
  // components: {},
  props:{
    insideDropdown:{type:Boolean, default:false},
    dropup:{type:Boolean, default:false},
    dropright:{type:Boolean, default:false},
    openOnHover:{type:Boolean, default:false},
    size:{type:String, default:"md"},
    variant:{type:String, default:"primary"},
  },
  data: () => ({
    styles:{
      themes:[
        // Created with https://bootstrap.build/app :
        // {title: "opsi-dark", rel:"~/assets/themes/theme-opsi-color-dark.css"},
        // {title: "opsi-light", rel:"~/assets/themes/theme-opsi-color-light.css"},
        // Used from https://bootswatch.com/ :
        {title: "Bootswatch-Cerulean", rel:"//netdna.bootstrapcdn.com/bootswatch/3.0.0/cerulean/bootstrap.min.css"},
        {title: "Bootswatch-Cosmo", rel:"//netdna.bootstrapcdn.com/bootswatch/3.0.0/cosmo/bootstrap.min.css"},
        {title: "Bootswatch-Lumen", rel:"~/assets/theme-bootswatch-lumen.css"},
        {title: "Bootswatch-Cyborg", rel:"//netdna.bootstrapcdn.com/bootswatch/3.0.0/cyborg/bootstrap.min.css"},
        {title: "Bootswatch-Solar", rel:"//stackpath.bootstrapcdn.com/bootswatch/4.5.2/solar/bootstrap.min.css"},
        {title: "Bootswatch-Yeti", rel:"//stackpath.bootstrapcdn.com/bootswatch/4.5.2/yeti/bootstrap.min.css"},
        {title: "Bootswatch-Slate", rel:"https://stackpath.bootstrapcdn.com/bootswatch/4.5.2/slate/bootstrap.min.css"},
        {title: "Bootswatch-Sketchy", rel:"https://stackpath.bootstrapcdn.com/bootswatch/4.5.2/sketchy/bootstrap.min.css"},
        {title: "Bootswatch-Lux", rel:"https://stackpath.bootstrapcdn.com/bootswatch/4.5.2/lux/bootstrap.min.css"},
      ],
    },
  }),
  computed:{
    ...mapGetters({
      XgetColorTheme: "settings/colortheme",
    }),
    theme: {
      get: function () {
        return this.XgetColorTheme.title
      },
      set: function (theme) {
        this.setTheme(theme);
      }
    }
  },
  methods: {
    ...mapMutations({
      XsetColorTheme: 'settings/setColorTheme',
    }),
    setTheme(theme){
        console.log("set theme ", theme.title)
        this.XsetColorTheme(theme)
        console.log("get theme ", this.theme)
    },
  }
}
</script>
<style>
</style>