<template>
  <div class="container-fluid">
    <ViewVProducts id="products" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class PageProducts extends Vue {
}
</script>
