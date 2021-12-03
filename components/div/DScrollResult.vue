<template>
  <div class="content-scroll" data-testid="DivDScrollResult">
    <slot name="content" />
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
  max-height: 670px !important;
  overflow-x: auto;
  overflow-y: auto;
}
</style>
