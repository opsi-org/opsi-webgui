<template>
  <div class="btn btn-secondary dd-theme text-left">
    <b-nav-item-dropdown
      style="height:100%;margin:0px;"
      variant="secondary"
      :text="$i18n.locale"
      alt="select theme"
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
import { Component, Vue } from 'nuxt-property-decorator'

@Component export default class DDLang extends Vue {
  languages: Array<string> = ['en', 'de']

  changeLanguage (lang : string) {
    this.$i18n.locale = lang
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
