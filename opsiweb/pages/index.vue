<template>
  <div class="container">
    <div>
      <Logo />
      <h1 class="title">
        opsiweb
      </h1>
      <!-- <div>
        <ButtonBTNLogout />
        <DropdownDDTheme />
      </div> -->
      <h4>Modules content: </h4>
      <div v-for="v,k in modules" :key="k">
        <p>{{ k }}:{{ v }}</p>
      </div>
      <div class="links">
        <a
          href="https://nuxtjs.org/"
          target="_blank"
          rel="noopener noreferrer"
          class="button--green"
        >
          Documentation
        </a>
        <a
          href="https://github.com/nuxt/nuxt.js"
          target="_blank"
          rel="noopener noreferrer"
          class="button--grey"
        >
          GitHub
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class PIndex extends Vue {
  async asyncData ({ $axios }: any): Promise<any> {
    return {
      modules: (await $axios.$post('/api/opsidata/modulesContent')).result
    }
  }
}
</script>

<style>
</style>
