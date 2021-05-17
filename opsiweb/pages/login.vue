<template>
  <div class="container">
    <div>
      <h1 class="title">
        opsiweb
      </h1>
      <FormFLogin />
    </div>
  </div>
</template>
<script lang="ts">
// import { Component, Vue } from 'nuxt-property-decorator'
// @Component export default class PLogin extends Vue {
// }
import { Vue, Component } from 'nuxt-property-decorator'
@Component({
  layout: 'auth'
})
export default class PLogin extends Vue {}
</script>

<style>
</style>
