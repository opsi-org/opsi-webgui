<template>
  <div class="content-scroll" data-testid="DivDScrollResult">
    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class DScrollResult extends Vue {
}
</script>

<style>
.content-scroll{
  min-height: 77vh !important;
  max-height: 77vh !important;
  overflow-x:hidden;
  overflow-y: auto;
}
</style>
