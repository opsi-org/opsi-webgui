<template>
  <div class="fixed-bottom">
    <b-navbar
      toggleable="md"
      fixed="bottom"
      :class="{auth_footer: $mq === 'desktop', auth_footer_wrap: $mq === 'mobile'}"
    >
      <b-navbar-nav small class="ml-auto">
        <b>Selection:- </b>
        Depots   : {{ selectionDepots }} <br>
        Clients  : {{ selectionClients }} <br>
        Products : {{ selectionProducts }} <br>
      </b-navbar-nav>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')
@Component
export default class BDefaultFooter extends Vue {
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionProducts!: Array<string>
}
</script>

<style>
.auth_footer{
  height: var(--height-navbar) !important;
}
.auth_footer_wrap {
  display: flex;
  flex-wrap: wrap;
}
.navbar {
  z-index: inherit !important;
}
</style>
